const express = require('express');
const router = express.Router();
const {getNextEvent} = require('../controllers/eventController');


router.get('/event/next',
    getNextEvent
)


module.exports = router;