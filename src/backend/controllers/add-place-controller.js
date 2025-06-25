const sharp = require("sharp");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const cloudinary = require("cloudinary").v2;

// NEed to find some way to not call the db params twice
let db;
try {
    db = require('../firebase-admin');
    console.log('success!')
} catch (err) {
    console.error("Failed to load Firebase Admin SDK:", err);
    process.exit(1);
}

// Config from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all places in the DB
const getPlaces = async (req, res) => {
    try {
        const ref = db.ref("places");
        const snapshot = await ref.once("value");
        res.status(200).json(snapshot.val());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST place to DB and img to cloudinary
const postPlace = async (req, res) => {

    const {
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


    try {
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

        const placeRef = db.ref(`places/${continent}/${country}/${city}/${name}`);

        await placeRef.set({
            continent,
            country,
            city,
            name,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            notes,
            imageUrl: imageOutput.url,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Place creation failed:", error);
        res.status(500).json({ error: "Failed to create place" });
    }
};

module.exports = {
    getPlaces,
    postPlace,
};
