const pool = require('../database/connection');
require('dotenv').config();


const getConfig = async (req, res) => {
    try {
        const [config] = await pool.query('SELECT * FROM config');
        res.json({ config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getConfigById = async (req, res) => {
    try {
        const { id } = req.params;
        const [config] = await pool.query('SELECT * FROM config WHERE id = ?', [id]);
        if (config.length === 0) {
            return res.status(404).json({ message: 'Config not found' });
        }
        res.json({ config: config[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createConfig = async (req, res) => {
    try {
        const { key, value } = req.body;
        const result = await pool.query('INSERT INTO config (key, value) VALUES (?, ?)', [key, value]);
        res.status(201).json({ id: result.insertId, key, value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        const result = await pool.query('UPDATE config SET value = ? WHERE id = ?', [value, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Config not found' });
        }
        res.json({ message: 'Config updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM config WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Config not found' });
        }
        res.json({ message: 'Config deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getConfig, getConfigById, createConfig, updateConfig, deleteConfig };