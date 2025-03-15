const express = require('express');
const router = express.Router();
const { registerUser, loginUser, renewToken } = require('../controllers/authController');
const { check } = require('express-validator');
const { validarFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {getUser} = require('../controllers/userController'); 


router.get('/user',
    validateJWT,
    getUser
)

module.exports = router;