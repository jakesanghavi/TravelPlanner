const express = require('express')
const multer = require('multer')

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const { getPlaces, postPlace } = require("../controllers/add-place-controller");

const {
    getUserByUsername,
    getUserByEmail,
    postUser ,
    updateUser,
    getUsers,
    getOneUser,
    loginUserWithPassword,
    forgotPassword,
    resetPassword
} = require('../controllers/users-controller')

const {
    getCookieUser,
    postCookieUser,
    updateCookieUser,
    deleteCookieUser,
} = require('../controllers/cookie-user-controller')

// GET places
router.post("/places", getPlaces);

// POST place with image upload
router.post("/upload-place", upload.single('image'), postPlace);

// GET a specific user by email
router.get('/users/email/:id', getUserByEmail);

// GET a specific user by email
router.get('/users/username/:id', getUserByUsername);

// POST a user to the DB
router.post('/users/:id', postUser)

// PATCH a user in the DB
router.post('/users/patchcookie/:id', updateUser)

// GET all users
router.get('/users/getall', getUsers)

// POST a user to see if credentials are right
router.get('/users/passwordlogin', loginUserWithPassword)

// GET a single user
router.get('/users/getone/:id', getOneUser)

// GET a specific user by cookie ID
router.get('/users/userID/:id', getCookieUser);

// POST a cookie user to the DB
router.post('/users/userID/post/:id', postCookieUser)

// PATCH a cookie user in the DB
router.post('/users/userID/patch/:id', updateCookieUser)

// DELETE a cookie user in the DB
router.post('/users/userID/del/:id', deleteCookieUser)

// GET a specific user by cookie ID
router.get('/users/userID/:id', getCookieUser);

module.exports = router;
