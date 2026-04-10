const express = require('express');
const router = express.Router();
const {getCountry, getClientRuntimeConfig} = require('../controllers/auxiliaryController');


router.get('/auxiliary/country',
    getCountry
)

router.get('/auxiliary/client-config',
    getClientRuntimeConfig
)


module.exports = router;
