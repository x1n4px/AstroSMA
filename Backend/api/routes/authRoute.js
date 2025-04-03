const express = require('express');
const router = express.Router();
const { registerUser, loginUser, renewToken, QRLoginUser } = require('../controllers/authController');
const { check } = require('express-validator');
const { validarFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const {getUser} = require('../controllers/userController'); 

router.post('/register',
    [
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('surname', 'El apellido es obligatorio').not().isEmpty(),
        validarFields
    ],
    registerUser);
router.post('/login',
    [
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validarFields
    ],
    loginUser);

router.post('/QRlogin',
    QRLoginUser
)

router.get('/renew',
    validateJWT,
    renewToken
)


module.exports = router;