process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const express = require("express");
const cors = require('cors');
let db;
try {
  db = require('./firebase-admin');
  console.log('success!')
} catch (err) {
  console.error("Failed to load Firebase Admin SDK:", err);
  process.exit(1);
}
// const db = require("./firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

// CORS options: explicitly allow frontend origin
const corsOptions = {
  origin: 'http://localhost:5173', // your React dev server URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions)); // use CORS middleware with options
app.use(express.json());    // parse JSON body

// Your routes below
app.get("/places", async (req, res) => {
  try {
    const ref = db.ref("places");
    const snapshot = await ref.once("value");
    res.status(200).json(snapshot.val());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/places", async (req, res) => {
  const { continent, country, city, lat, lng, notes = "" } = req.body;

  // Validate required fields
  if (!continent || !country || !city) {
    return res.status(400).json({ error: "Continent, country, and city are required." });
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "Latitude and longitude must be numbers." });
  }

  const safeData = {
    lat,
    lng,
    notes
  };

  try {
    const ref = db.ref(`places/${continent}/${country}/${city}`);
    await ref.set(safeData);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});