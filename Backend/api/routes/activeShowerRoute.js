const express = require('express');
const router = express.Router();
const {getAllShower} = require('../controllers/activeShowerController');


router.get('/activeShower/shower',
    getAllShower
)


module.exports = router;