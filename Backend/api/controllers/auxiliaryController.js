const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getCountry = async (req, res) => {
    try {

        const [country] = await pool.query('SELECT * FROM pais');
        res.json({country});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getCountry };