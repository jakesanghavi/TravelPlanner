import React, { useState } from 'react';
import { fetchFlightsFromBackend } from '../api';

const FlightSearchForm = () => {
  const [args, setArgs] = useState({
    origin: '',
    destination: '',
    depart_date: '',
    return_date: '',
    type: '',
    adults: 0,
    children: 0,
    max_stops: 0,
    trip: '',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const thStyle = {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  };

  const tdStyle = {
    padding: '10px',
    verticalAlign: 'top',
  };

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
      // Use fetchFlightsFromBackend here and await it
      const flightResults = await fetchFlightsFromBackend(args);
      console.log(flightResults.flights)
      setResults(flightResults);
    } catch (err) {
      setError('Failed to fetch flight data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ color: 'black' }}>
        {/* Inputs */}
        <div>
          <label>
            Origin:
            <input
              type="text"
              name="origin"
              value={args.origin}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Destination:
            <input
              type="text"
              name="destination"
              value={args.destination}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Depart Date:
            <input
              type="date"
              name="depart_date"
              value={args.depart_date}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Return Date:
            <input
              type="date"
              name="return_date"
              value={args.return_date}
              onChange={handleChange}
              style={{ color: 'black' }}
              required={args.trip === 'round-trip'}
              disabled={args.trip !== 'round-trip'}
            />
          </label>
        </div>
        <div>
          <label>
            Type:
            <select
              name="type"
              value={args.type}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            >
              <option value="">Select Type</option>
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Adults:
            <select
              name="adults"
              value={args.adults}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Children:
            <select
              name="children"
              value={args.children}
              onChange={handleChange}
              style={{ color: 'black' }}
            >
              {[...Array(6)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Max Stops:
            <select
              name="max_stops"
              value={args.max_stops}
              onChange={handleChange}
              style={{ color: 'black' }}
            >
              {[0, 1, 2].map((stop) => (
                <option key={stop} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Trip:
            <select
              name="trip"
              value={args.trip}
              onChange={handleChange}
              style={{ color: 'black' }}
              required
            >
              <option value="">Select Trip</option>
              <option value="one-way">One Way</option>
              <option value="round-trip">Round Trip</option>
              <option value="multi-city">Multi-City</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Array.isArray(results?.flights) && results.flights.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: 'black' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={thStyle}>Airline</th>
              <th style={thStyle}>Departure</th>
              <th style={thStyle}>Arrival</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Stops</th>
              <th style={thStyle}>Delay</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Best</th>
            </tr>
          </thead>
          <tbody>
            {results.flights.slice(0, 5).map((flight, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={tdStyle}><strong>{flight.name}</strong></td>
                <td style={tdStyle}>{flight.departure}</td>
                <td style={tdStyle}>
                  {flight.arrival} {flight.arrival_time_ahead && `(${flight.arrival_time_ahead})`}
                </td>
                <td style={tdStyle}>{flight.duration}</td>
                <td style={tdStyle}>{typeof flight.stops === 'number' ? flight.stops : 'Unknown'}</td>
                <td style={tdStyle}>{flight.delay || 'None'}</td>
                <td style={tdStyle}>{flight.price}</td>
                <td style={tdStyle}>{flight.is_best ? '🌟' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

      ) : (
        <p>No flights found.</p>
      )}
    </>
  );
};

export default FlightSearchForm;
