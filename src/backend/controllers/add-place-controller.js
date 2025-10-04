import sharp from "sharp";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";
import db from "../firebase-admin.js";

// Config from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all places in the DB
const getPlaces = async (req, res) => {

    const { user } = req.body;

    try {
        const ref = db.ref(`places/${user}`);
        const snapshot = await ref.once("value");
        res.status(200).json(snapshot.val());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SET TO 1 FOR NOW SO USELESS ATM
const tileSize = 1.0;

// NOT CURRENTLY USED
// Can get the current tile id if not doing neighbor method
const getTileID = (lat, lon) => {
    const tileLat = Math.floor(lat / tileSize);
    const tileLon = Math.floor(lon / tileSize);
    return `${tileLat}_${tileLon}`;
};

// Get neighboring tiles in a 3x3 box
const getNeighborTiles = (lat, lon) => {
    const baseLat = Math.floor(lat / tileSize);
    const baseLon = Math.floor(lon / tileSize);

    const neighbors = [];
    for (let dLat = -1; dLat <= 1; dLat++) {
        for (let dLon = -1; dLon <= 1; dLon++) {
            neighbors.push(`${baseLat + dLat}_${baseLon + dLon}`);
        }
    }
    return neighbors;
};

// Calculate haversine distance to account for earth curvature
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = x => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};


// POST place to DB and img to cloudinary
const postPlace = async (req, res) => {

    const {
        username,
        continent,
        country,
        city,
        name,
        lat,
        lng,
        notes = "",
    } = req.body;
    const file = req.file; // The uploaded file

    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, file.originalname);

    // Get tile neighbors
    const tileIDs = getNeighborTiles(lat, lng);
    const stationsRef = db.ref("stations");

    let candidateStations = [];

    // Query over just the tile neighbors in the DB and add to our candidate list
    for (const tileID of tileIDs) {
        const snapshot = await stationsRef.child(tileID).once("value");
        const stations = snapshot.val();
        if (stations) {
            candidateStations.push(...Object.values(stations));
        }
    }

    let closestStation = null;
    let minDist = Infinity;

    // Get the closest station, if any
    for (const station of candidateStations) {
        const dist = haversineDistance(lat, lng, station.station_lat, station.station_long);
        if (dist < minDist) {
            minDist = dist;
            closestStation = station;
        }
    }


    try {
        // Downsize file to save cloudinary space
        await sharp(file.buffer)
            .resize({ width: 800 })
            .jpeg({ quality: 50 })
            .toFile(filePath);

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        let imageOutput = null;


        // Upload to cloudinary and return the image url if success
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            });
            imageOutput = result;
        } catch (error) {
            console.error(error);
            return
        }

        // Delete temp file
        await fs.unlink(filePath);

        // Set where in the db it goes
        const placeRef = db.ref(`places/${username}/${continent}/${country}/${city}/${name}`);

        // Add to firebase
        await placeRef.set({
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            notes,
            imageUrl: imageOutput.url,
            normals: closestStation?.normals || null
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Place creation failed:", error);
        res.status(500).json({ error: "Failed to create place" });
    }
};

export {
    getPlaces,
    postPlace,
};
