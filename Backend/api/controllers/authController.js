const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();
const auditEvent = require('../middlewares/audit')


const registerUser = async (req, res) => {
    try {
        const { email, password, name, surname, countryId, institution, isMobile } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = '00000001';

        // Obtener el último ID
        const [lastIdResult] = await pool.query('SELECT MAX(id) AS maxId FROM user');
        const lastId = lastIdResult[0].maxId || 0; // Obtener el valor maxId, o 0 si no hay registros

        const newId = lastId + 1; // Generar el nuevo ID
        await pool.query(
            'INSERT INTO user (id, email, password, name, surname, pais_id, institucion, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newId, email, hashedPassword, name, surname, countryId, institution, rol]
        );

        // Generar el token JWT
        const token = jwt.sign({ userId: newId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const saf = auditEvent('REGISTER', newId, 'register', -1, 0, 'Registro de usuario', isMobile);

        res.status(201).json({ token, rol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, isMobile } = req.body;
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        const saf = auditEvent('ACCESS', user.id, 'login', -1, 0, 'Inicio de sesión', isMobile);
        res.json({ token, rol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const QRLoginUser = async (req, res) => {
    try {
        const { path } = req.body;
        const token = jwt.sign({ userId: path }, process.env.JWT_SECRET, { expiresIn: '2h' });
        const rol = '00000000';
        res.json({ token, rol });
    } catch (error) {
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


module.exports = { registerUser, loginUser, renewToken, QRLoginUser };