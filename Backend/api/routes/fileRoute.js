const express = require('express');
const router = express.Router();
const {getOrbitFile} = require('../controllers/fileController');


router.get('/detecciones', getOrbitFile);


module.exports = router;