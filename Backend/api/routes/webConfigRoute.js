const express = require('express');
const router = express.Router();
const {getConfig, getConfigById, createConfig, updateConfig, deleteConfig} = require('../controllers/webConfigController');
const {validateJWT} = require('../middlewares/validate-jwt');
 
router.get('/config',[validateJWT], getConfig);
router.get('/config/:id',[validateJWT], getConfigById);
router.post('/config/',[validateJWT], createConfig);
router.put('/config/:id',[validateJWT], updateConfig);
router.delete('/config/:id',[validateJWT], deleteConfig);

module.exports = router;