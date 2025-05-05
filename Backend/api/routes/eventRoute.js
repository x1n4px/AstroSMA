const express = require('express');
const router = express.Router();
const { getNextEvent,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent } = require('../controllers/eventController');

const { validateRol } = require('../middlewares/validate-rol');
const { validateJWT } = require('../middlewares/validate-jwt');



router.get('/event/next',
    getNextEvent
)

router.get('/event/all',
    [validateJWT, validateRol],
    getAllEvents
)
router.get('/event/:id',
    [validateJWT, validateRol],
    getEventById
)
router.post('/event',
    [validateJWT, validateRol],
    createEvent
)
router.put('/event/:id',
    [validateJWT, validateRol],
    updateEvent
)
router.delete('/event/:id',
    [validateJWT, validateRol],
    deleteEvent
)


module.exports = router;