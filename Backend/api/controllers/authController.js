const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const registerUser = async (req, res) => {
    try {
        const { email, password, name, surname, countryId, institution } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = '00000000'
        const [result] = await pool.query('INSERT INTO user (email, password, name, surname, country_id, institution, rol ) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, hashedPassword, name, surname, countryId, institution, rol]);
        const userId = result.insertId; // Obtener el ID del usuario insertado

        // Generar el token JWT
        const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, rol }); // Devolver el token
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const user = rows[0];
        const rol = user.rol;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, rol });
    } catch (error) {
        console.log("Error")
        res.status(500).json({ error: error.message });
    }
};

const renewToken = async (req, res = response) => {
    const uid = req.uid;
    // Generar el token - JWT
    const token = await generarJWT(uid);

    res.json({
        ok: true,
        token
    });
}


module.exports = { registerUser, loginUser, renewToken };