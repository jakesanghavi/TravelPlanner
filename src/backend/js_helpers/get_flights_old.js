const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const {
  encodeInfo,
  encodeSeat,
  encodeTrip,
  encodePassenger,
} = require('./flights_proto.js');

// Your classes, unchanged except minor fixes for integration

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
      ...Array(adults).fill(encodePassenger.ADULT),
      ...Array(children).fill(encodePassenger.CHILD),
      ...Array(infants_in_seat).fill(encodePassenger.INFANT_IN_SEAT),
      ...Array(infants_on_lap).fill(encodePassenger.INFANT_ON_LAP),
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
    return btoa(String.fromCharCode(...uint8));
  }
}

function parseEnum(enumObj, str) {
  const key = str.toUpperCase().replace(/-/g, '_');
  if (!(key in enumObj)) {
    throw new Error(`Invalid enum value '${str}'`);
  }
  return enumObj[key];
}

// New integrated getFlights function that fetches and parses the flight results

async function getFlights(filter, currency = '', mode = 'common') {
  const tfs = filter.asB64();

  const params = new URLSearchParams({
    tfs,
    hl: 'en',
    tfu: 'EgQIABABIgA',
    curr: currency,
  });

  const url = `https://www.google.com/travel/flights?${params.toString()}`;

  // Fetch the flights page
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'en-US,en;q=0.9',
      // Add User-Agent or cookies if needed
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch flights: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const $ = cheerio.load(text);
  await fs.writeFile('output.txt', text, 'utf8');
  const flights = [];

  function getTextSafe(el) {
    return el?.text()?.trim() ?? '';
  }

  $('div[jsname="IWWDBc"], div[jsname="YdtKid"]').each((i, fl) => {
    const isBestFlight = i === 0;
    const flightListItems = $(fl).find('ul.Rk10dc li').toArray();
    const itemsToParse = flightListItems.slice(0, -1); // exclude last

    itemsToParse.forEach(item => {
      const el = $(item);
      const name = getTextSafe(
        el.find('div.sSHqwe.tPgKwe.ogfYpf span').first()
      );

      const dpArNodes = el.find('span.mv1WYe div').toArray();
      const departureTime = dpArNodes[0] ? $(dpArNodes[0]).text().trim() : '';
      const arrivalTime = dpArNodes[1] ? $(dpArNodes[1]).text().trim() : '';

      const timeAhead = getTextSafe(el.find('span.bOzv6').first());
      const duration = getTextSafe(el.find('li div.Ak5kof div').first());
      const stops = getTextSafe(el.find('.BbR8Ec .ogfYpf').first());
      const delay = getTextSafe(el.find('.GsCCve').first()) || null;
      const priceRaw = getTextSafe(el.find('.YMlIz.FpEdX').first()) || '0';

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

  const currentPrice = getTextSafe($('span.gOatQ').first());

  if (!flights.length) {
    throw new Error('No flights found');
  }

  return {
    current_price: currentPrice,
    flights,
  };
}

// Main example usage

async function main() {
  const args = {
    origin: 'JFK',
    destination: 'LAX',
    depart_date: '2025-06-30',
    return_date: '2025-07-10',
    type: 'economy',
    adults: 2,
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

  const passengers = new Passengers({ adults: args.adults });

  const tripEnum = parseEnum(encodeTrip, args.trip);
  const seatEnum = parseEnum(encodeSeat, args.type);

  const filter = new TFSFilter({
    flight_data: flightData,
    trip: tripEnum,
    seat: seatEnum,
    passengers,
    max_stops: args.max_stops,
  });

  // Log URL and fetch flight results
  const results = await getFlights(filter);
}

main().catch(console.error);
