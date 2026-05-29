const express = require('express');
const router = express.Router();
const {getPhotometryFromId, getPhotometryGraph} = require('../controllers/photometryController');
const {validateJWT} = require('../middlewares/validate-jwt');


router.get('/photometry/:selectedId',
    validateJWT,
    getPhotometryFromId
)

router.get('/photometry/:selectedId/graph',
    validateJWT,
    getPhotometryGraph
)


module.exports = router;
