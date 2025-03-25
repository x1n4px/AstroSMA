const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getUser = async (req, res) => {
    try {
        const token = req.header('x-token');

        const id = extraerUserId(token);
        const [rows] = await pool.query('SELECT u.id, u.email, u.name, u.surname, u.institucion , p.nombre as countryName FROM `user` u JOIN pais p ON p.id = u.pais_id WHERE u.id = ?', [id]);
        const user = rows[0];
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getUser };