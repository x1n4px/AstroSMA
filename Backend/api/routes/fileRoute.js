const express = require('express');
const router = express.Router();
const {getOrbitFile, testing} = require('../controllers/fileController');


router.get('/detecciones', getOrbitFile);

router.post('/testing', testing);

module.exports = router;