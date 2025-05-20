const express = require('express');
const router = express.Router();
const { registerUser, loginUser, renewToken } = require('../controllers/authController');
const { check } = require('express-validator');
const { validarFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {getUser, getAllUser, updateUserRole, updatePassword} = require('../controllers/userController'); 
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

router.put('/user/updateRole',
    validateJWT,
    validateRol,
    check('id', 'El id es obligatorio').not().isEmpty(),
    check('rol', 'El rol es obligatorio').not().isEmpty(),
    validarFields,
    updateUserRole
)

router.put('/user/updatePassword',
    validateJWT,
    validarFields,
    updatePassword
)

module.exports = router;