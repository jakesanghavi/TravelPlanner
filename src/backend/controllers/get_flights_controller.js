import { retrieveFlights } from "../js_helpers/get_flights.js";

const getFlights = async (req, res) => {
  const data = req.body.data;

  try {
    const flights = await retrieveFlights(data);
    res.status(200).json({ flights });
  } catch (err) {
    console.error('Error retrieving flights:', err);
    res.status(500).json({ error: err.message });
  }
};

export { getFlights }