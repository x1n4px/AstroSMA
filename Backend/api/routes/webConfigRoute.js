const express = require('express');
const router = express.Router();
const {getConfig, getConfigById, createConfig, updateConfig, deleteConfig} = require('../controllers/webConfigController');
const {validateJWT} = require('../middlewares/validate-jwt');
const {validateRol} = require('../middlewares/validate-rol');

 
router.get('/config',[validateJWT, validateRol], getConfig);
router.get('/config/:id',[validateJWT, validateRol], getConfigById);
router.post('/config/',[validateJWT, validateRol], createConfig);
router.put('/config/:id',[validateJWT, validateRol], updateConfig);
router.delete('/config/:id',[validateJWT, validateRol], deleteConfig);

module.exports = router;