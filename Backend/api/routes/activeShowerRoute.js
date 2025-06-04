const express = require('express');
const router = express.Router();
const {getAllShower, getNextShower, duplicateRain, getRainById, createRain, updateRain, deleteRain} = require('../controllers/activeShowerController');


router.get('/activeShower/shower', getAllShower)

router.get('/activeShower/nextShower', getNextShower );

router.post('/activeShower/duplicateRain/year/:year', duplicateRain);

router.get('/activeShower/rain/year/:year', getRainById);

router.post('/activeShower/rain', createRain);

router.put('/activeShower/rain/:id/year/:year', updateRain);

router.delete('/activeShower/rain/:id/year/:year', deleteRain);


module.exports = router;