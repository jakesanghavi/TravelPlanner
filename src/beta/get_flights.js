import {
  encodeInfo,
  encodeSeat,
  encodeTrip,
  encodePassenger,
} from './flights_proto.js';

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
    this.flight_data = flight_data; // Array of FlightData instances
    this.trip = trip; // enum value from encodeTrip
    this.seat = seat; // enum value from encodeSeat
    this.passengers = passengers; // Passengers instance
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
    // Convert Uint8Array to base64 string
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

// Usage example:

const args = {
  origin: 'JFK',
  destination: 'LAX',
  depart_date: '2025-06-30',
  return_date: '2025-07-10',
  type: 'economy',
  adults: 1,
  max_stops: 1,
  trip: 'round-trip',
};

async function main() {
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

  const b64 = filter.asB64();
  const url = `https://www.google.com/travel/flights?tfs=${b64}`;
  console.log('Google Flights URL:', url);

  // Placeholder for fetching results with the filter
  // Next need to implemenet getflights
  /*
  const result = await getFlights(filter);
  console.log("Result:", result);
  */
}

main().catch(console.error);