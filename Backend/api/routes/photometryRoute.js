const express = require('express');
const router = express.Router();
const {getPhotometryFromId} = require('../controllers/photometryController');
const {validateJWT} = require('../middlewares/validate-jwt');


router.get('/photometry/:selectedId',
    validateJWT,
    getPhotometryFromId
)


module.exports = router;