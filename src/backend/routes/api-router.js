const express = require('express')
const multer = require('multer')

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const { getPlaces, postPlace } = require("../controllers/add-place-controller");

// GET places
router.get("/places", getPlaces);

// POST place with image upload
router.post("/upload-place", upload.single('image'), postPlace);

module.exports = router;
