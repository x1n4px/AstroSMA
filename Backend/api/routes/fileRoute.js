const express = require('express');
const router = express.Router();
const {getOrbitFile} = require('../controllers/fileController');


router.get('/detecciones/:anio/:mes/:dia/:hora/:minuto/:segundo/:fileName/:id1/:id2', getOrbitFile);


module.exports = router;