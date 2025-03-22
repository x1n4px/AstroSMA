const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getAllShower = async (req, res) => {
    try {

        const [shower] = await pool.query('SELECT DISTINCT * FROM Lluvia l GROUP BY Identificador');
        res.json({shower});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllShower };