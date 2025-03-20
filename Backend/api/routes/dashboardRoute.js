const express = require('express');
const router = express.Router();
const {getGeneral} = require('../controllers/dashboardController');
const {validateJWT} = require('../middlewares/validate-jwt');


router.get('/dashboard',
    validateJWT,
    getGeneral
)


module.exports = router;