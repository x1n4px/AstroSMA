const express = require('express');
const router = express.Router();
const {getNextEvent,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent} = require('../controllers/eventController');


router.get('/event/next',
    getNextEvent
)

router.get('/event/all',
    getAllEvents
)
router.get('/event/:id',
    getEventById
)
router.post('/event',
    createEvent
)
router.put('/event/:id',
    updateEvent
)
router.delete('/event/:id',
    deleteEvent
)


module.exports = router;