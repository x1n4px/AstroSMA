const express = require('express');
const router = express.Router();
const {getAllShower, getNextShower} = require('../controllers/activeShowerController');


router.get('/activeShower/shower',
    getAllShower
)

router.get('/activeShower/nextShower', getNextShower );


module.exports = router;