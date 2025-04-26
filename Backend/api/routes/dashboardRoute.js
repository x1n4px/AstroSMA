const express = require('express');
const router = express.Router();
const {getGeneral, getGeneralHome} = require('../controllers/dashboardController');
const {validateJWT} = require('../middlewares/validate-jwt');


router.get('/dashboard',
    validateJWT,
    getGeneral
)


router.get('/dashboard/home',
    getGeneralHome
)

module.exports = router;