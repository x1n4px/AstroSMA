const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middlewares/validate-jwt');


const {
    getRequests, getRequestById, createRequest, updateRequest, deleteRequest
} = require('../controllers/requestController');

router.post('/request',validateJWT, createRequest);
router.get('/request',validateJWT, getRequests);

router.get('/request/:id',validateJWT, getRequestById);
router.put('/request/:id',validateJWT, updateRequest);
router.delete('/request/:id',validateJWT, deleteRequest);

module.exports = router;