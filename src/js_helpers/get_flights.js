const { chromium } = require('playwright');

const {
  encodeInfo,
  encodeSeat,
  encodeTrip,
  encodePassenger,
} = require('./flights_proto.js');

class FlightData {
  constructor({
    date,
    from_airport,
    to_airport,
    max_stops = null,
    airlines = [],
  }) {
    this.date = date;
    this.from_flight = { airport: from_airport };
    this.to_flight = { airport: to_airport };
    this.max_stops = max_stops;
    this.airlines = airlines;
  }

  toProtoObject() {
    return {
      date: this.date,
      from_flight: this.from_flight,
      to_flight: this.to_flight,
      max_stops: this.max_stops,
      airlines: this.airlines,
    };
  }
}

class Passengers {
  constructor({
    adults = 0,
    children = 0,
    infants_in_seat = 0,
    infants_on_lap = 0,
  }) {
    if (infants_on_lap > adults)
      throw new Error('At least one adult per infant on lap');
    if (adults + children + infants_in_seat + infants_on_lap > 9)
      throw new Error('Too many passengers');

    this.pbArray = [
      ...Array(adults).fill('ADULT'),
      ...Array(children).fill('CHILD'),
      ...Array(infants_in_seat).fill('INFANT_IN_SEAT'),
      ...Array(infants_on_lap).fill('INFANT_ON_LAP'),
    ];
  }

  toProtoArray() {
    return this.pbArray;
  }
}

class TFSFilter {
  constructor({ flight_data, trip, seat, passengers, max_stops = null }) {
    this.flight_data = flight_data;
    this.trip = trip;
    this.seat = seat;
    this.passengers = passengers;
    this.max_stops = max_stops;
  }

  toProtoObject() {
    return {
      data: this.flight_data.map(fd => {
        const proto = fd.toProtoObject();
        if (this.max_stops !== null) proto.max_stops = this.max_stops;
        return proto;
      }),
      trip: this.trip,
      seat: this.seat,
      passengers: this.passengers.toProtoArray(),
    };
  }

  asUint8Array() {
    const obj = this.toProtoObject();
    return encodeInfo(obj);
  }

  asB64() {
    const uint8 = this.asUint8Array();
    // Browser btoa is not available in node; use Buffer:
    return Buffer.from(uint8).toString('base64');
  }
}

function parseEnum(enumObj, str) {
  const key = str.toUpperCase().replace(/-/g, '_');
  if (!(key in enumObj)) {
    throw new Error(`Invalid enum value '${str}'`);
  }
  return enumObj[key];
}

async function getFlights(filter, currency = '') {
  const tfs = filter.asB64();

  const params = new URLSearchParams({
    tfs,
    hl: 'en',
    tfu: 'EgQIABABIgA',
    curr: currency,
  });

  const url = `https://www.google.com/travel/flights?${params.toString()}`;
  console.log('Google Flights URL:', url);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Wait for flights container (adjust timeout as needed)
  await page.waitForSelector('div[jsname="IWWDBc"], div[jsname="YdtKid"]', { timeout: 15000 });

  // Evaluate flight data inside the page context:
  const results = await page.evaluate(() => {
    function getTextSafe(el) {
      return el ? el.textContent.trim() : '';
    }

    const flights = [];

    const flightDivs = Array.from(document.querySelectorAll('div[jsname="IWWDBc"], div[jsname="YdtKid"]'));
    flightDivs.forEach((fl, i) => {
      const isBestFlight = i === 0;
      const flightListItems = Array.from(fl.querySelectorAll('ul.Rk10dc li'));
      // Mimic python slicing logic for last item exclusion except for first or dangerous flag
      const itemsToParse = flightListItems.slice(0, -1);

      itemsToParse.forEach(item => {
        const name = getTextSafe(item.querySelector('div.sSHqwe.tPgKwe.ogfYpf span'));

        const dpArNodes = item.querySelectorAll('span.mv1WYe div');
        const departureTime = dpArNodes[0] ? dpArNodes[0].textContent.trim() : '';
        const arrivalTime = dpArNodes[1] ? dpArNodes[1].textContent.trim() : '';

        const timeAhead = getTextSafe(item.querySelector('span.bOzv6'));
        const duration = getTextSafe(item.querySelector('li div.Ak5kof div'));
        const stops = getTextSafe(item.querySelector('.BbR8Ec .ogfYpf'));
        const delay = getTextSafe(item.querySelector('.GsCCve')) || null;
        const priceRaw = getTextSafe(item.querySelector('.YMlIz.FpEdX')) || '0';

        let stopsFmt;
        if (stops === 'Nonstop') stopsFmt = 0;
        else {
          const m = stops.match(/^(\d+)/);
          stopsFmt = m ? parseInt(m[1], 10) : 'Unknown';
        }

        flights.push({
          is_best: isBestFlight,
          name,
          departure: departureTime,
          arrival: arrivalTime,
          arrival_time_ahead: timeAhead,
          duration,
          stops: stopsFmt,
          delay,
          price: priceRaw.replace(/,/g, ''),
        });
      });
    });

    const currentPriceEl = document.querySelector('span.gOatQ');
    const currentPrice = currentPriceEl ? currentPriceEl.textContent.trim() : '';

    return {
      current_price: currentPrice,
      flights,
    };
  });

  await browser.close();

  if (!results.flights.length) {
    throw new Error('No flights found');
  }

  return results;
}

async function main() {
  const args = {
    origin: 'JFK',
    destination: 'LAX',
    depart_date: '2025-07-02',
    return_date: '2025-07-10',
    type: 'economy',
    adults: 2,
    children: 1,
    max_stops: 0,
    trip: 'round-trip',
  };

  const flightData = [
    new FlightData({
      date: args.depart_date,
      from_airport: args.origin,
      to_airport: args.destination,
    }),
    new FlightData({
      date: args.return_date,
      from_airport: args.destination,
      to_airport: args.origin,
    }),
  ];

  const passengers = new Passengers({ adults: args.adults, children: args.children });

  const tripEnum = parseEnum(encodeTrip, args.trip);
  const seatEnum = parseEnum(encodeSeat, args.type);

  const filter = new TFSFilter({
    flight_data: flightData,
    trip: tripEnum,
    seat: seatEnum,
    passengers,
    max_stops: args.max_stops,
  });

  const results = await getFlights(filter);
  console.log('Flight results:', results);
}

main().catch(console.error);
