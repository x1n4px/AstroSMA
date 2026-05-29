const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middlewares/validate-jwt');
const { validateRol } = require('../middlewares/validate-rol');
const {
    getScientificRows,
    createScientificRow,
    updateScientificRow,
    deleteScientificRow
} = require('../controllers/adminScientificTableController');

router.get('/admin/scientific-tables/:tableKey', [validateJWT, validateRol], getScientificRows);
router.post('/admin/scientific-tables/:tableKey', [validateJWT, validateRol], createScientificRow);
router.put('/admin/scientific-tables/:tableKey', [validateJWT, validateRol], updateScientificRow);
router.delete('/admin/scientific-tables/:tableKey', [validateJWT, validateRol], deleteScientificRow);

module.exports = router;
