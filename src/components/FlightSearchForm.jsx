import React, { useState } from 'react';
import { fetchFlightsFromBackend } from '../api';
import Select from '../overrides/Select';
import Button from '../overrides/Button';
import SearchableSelect from '../overrides/SearchableSelect'
import DatePicker from '../overrides/DatePicker';
import { airports } from '../airports_import';

const FlightSearchForm = () => {
  const [args, setArgs] = useState({
    origin: '',
    destination: '',
    depart_date: '',
    return_date: '',
    type: 'economy',
    adults: 1,
    children: 0,
    max_stops: 0,
    trip: 'round-trip',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArgs((prev) => ({
      ...prev,
      [name]: ['adults', 'children', 'max_stops'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const flightResults = await fetchFlightsFromBackend(args);
      setResults(flightResults);
    } catch (err) {
      setError('Failed to fetch flight data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const airportsConst = airports();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 max-w-3xl mx-auto space-y-6 max-h-[90vh] overflow-y-scroll">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#43a4ff] to-blue-600 bg-clip-text text-transparent">
        Flight Search
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}>
        <div>
          <label className="block mb-1 font-medium text-slate-700">Trip</label>
          <Select
            name="trip"
            value={args.trip}
            onChange={handleChange}
            required
          >
            <option value="">Select Trip</option>
            <option value="one-way">One Way</option>
            <option value="round-trip">Round Trip</option>
            <option value="multi-city">Multi-City</option>
          </Select>
        </div>

        <div>
          <label>
            Origin:
            <SearchableSelect
              name="origin"
              options={airportsConst}
              value={args.origin}
              onChange={(e) => setArgs((prev) => ({ ...prev, origin: e.target.value }))}
              placeholder="Origin"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Destination:
            <SearchableSelect
              name="destination"
              options={airportsConst}
              value={args.destination}
              onChange={(e) => setArgs((prev) => ({ ...prev, destination: e.target.value }))}
              placeholder="Destination"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-slate-700">Depart Date</label>
            <DatePicker
              name="depart_date"
              value={args.depart_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-slate-700">Return Date</label>
            <DatePicker
              name="return_date"
              value={args.return_date}
              onChange={handleChange}
              required={args.trip === 'round-trip'}
              disabled={args.trip !== 'round-trip'}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-slate-700">Type</label>
          <Select
            name="type"
            value={args.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="economy">Economy</option>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium text-slate-700">Adults</label>
            <Select name="adults" value={args.adults} onChange={handleChange} required>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-slate-700">Children</label>
            <Select name="children" value={args.children} onChange={handleChange}>
              {[...Array(6)].map((_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-slate-700">Max Stops</label>
            <Select name="max_stops" value={args.max_stops} onChange={handleChange}>
              {[0, 1, 2].map((stop) => (
                <option key={stop} value={stop}>{stop}</option>
              ))}
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-[#43a4ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 py-3 text-lg font-medium text-white rounded-md shadow-md transition-all duration-300 transform hover:scale-105"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {Array.isArray(results?.flights) && results.flights.length > 0 ? (
        <table className="w-full border-collapse mt-6 text-black">
          <thead className="bg-slate-200">
            <tr>
              {['Airline', 'Departure', 'Arrival', 'Duration', 'Stops', 'Delay', 'Price', 'Best'].map((head) => (
                <th key={head} className="p-2 text-left border-b-2 border-slate-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.flights.slice(0, 5).map((flight, idx) => (
              <tr key={idx} className="border-b border-slate-300">
                <td className="p-2 font-semibold">{flight.name}</td>
                <td className="p-2">{flight.departure}</td>
                <td className="p-2">{flight.arrival} {flight.arrival_time_ahead && `(${flight.arrival_time_ahead})`}</td>
                <td className="p-2">{flight.duration}</td>
                <td className="p-2">{typeof flight.stops === 'number' ? flight.stops : 'Unknown'}</td>
                <td className="p-2">{flight.delay || 'None'}</td>
                <td className="p-2">{flight.price}</td>
                <td className="p-2">{flight.is_best ? '🌟' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">No flights found.</p>
      )}
    </div>
  );
};

export default FlightSearchForm;
