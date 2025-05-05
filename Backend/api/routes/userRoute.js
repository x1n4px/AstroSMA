const express = require('express');
const router = express.Router();
const { registerUser, loginUser, renewToken } = require('../controllers/authController');
const { check } = require('express-validator');
const { validarFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {getUser, getAllUser} = require('../controllers/userController'); 
const {validateRol} = require('../middlewares/validate-rol');


router.get('/user',
    validateJWT,
    getUser
)

router.get('/user/all',
    validateJWT,
    validateRol,
    getAllUser
)

module.exports = router;