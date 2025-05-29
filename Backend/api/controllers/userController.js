const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();


const getUser = async (req, res) => {
    try {
        const token = req.header('x-token');

        const id = extraerUserId(token);
        const [rows] = await pool.query('SELECT u.id, u.email, u.name, u.surname, u.institucion, u.is_blocked , p.nombre as countryName FROM `user` u JOIN pais p ON p.id = u.pais_id WHERE u.id = ?', [id]);
        const user = rows[0];
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getAllUser = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT u.id, u.email, u.name, u.surname, u.institucion, u.rol,  u.is_blocked , p.nombre as countryName FROM `user` u JOIN pais p ON p.id = u.pais_id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const updateUserRole = async (req, res) => {
    try {
        const { id, rol } = req.body;
        const token = req.header('x-token');
        let user_id = -1;
        if (token) {
            user_id = extraerUserId(token);
        }

        if (user_id === id) {
            return res.status(400).json({ error: 'You cannot change your own role' });
        }

        if (!id || !rol) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }

        const [result] = await pool.query('UPDATE `user` SET rol = ? WHERE id = ?', [rol, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updatePassword = async (req, res) => {
    try {
        const { id, oldPassword, newPassword } = req.body;
        if (!id || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'User ID, old password, and new password are required' });
        }

        const [rows] = await pool.query('SELECT password FROM `user` WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await pool.query('UPDATE `user` SET password = ? WHERE id = ?', [hashedPassword, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateUserBlockedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        if (typeof id === 'undefined') {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const [rows] = await pool.query('SELECT is_blocked FROM `user` WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentStatus = rows[0].is_blocked;
        const newStatus = !currentStatus;

        const [result] = await pool.query('UPDATE `user` SET is_blocked = ? WHERE id = ?', [newStatus, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User blocked status updated successfully', newStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUser, getAllUser, updateUserRole, updatePassword, updateUserBlockedStatus };
