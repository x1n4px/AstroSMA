const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getPhotometryFromId = async (req, res) => {
    try {
        const { selectedId } = req.params;
        const [photometryArray] = await pool.query('SELECT * FROM Informe_Fotometria where Identificador = ?', [selectedId]);
        const [regressionStart] = await pool.query('select * FROM Estrellas_usadas_para_regresión where Informe_Fotometria_Identificador = ?', [selectedId]);
        const [meteor] = await pool.query('SELECT * FROM Datos_meteoro_fotometria WHERE Informe_Fotometria_Identificador = ?c', [selectedId]);
        const [adjustPoint] = await pool.query('SELECT * FROM Puntos_del_ajuste WHERE Informe_Fotometria_Identificador = ?', [selectedId]);
            
        const response = {
            photometry: photometryArray[0],
            regressionStart: regressionStart,
            meteor: meteor[0],
            adjustPoint: adjustPoint
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getPhotometryFromId };