const express = require('express');
const router = express.Router();
const {getCountry} = require('../controllers/auxiliaryController');


router.get('/auxiliary/country',
    getCountry
)


module.exports = router;