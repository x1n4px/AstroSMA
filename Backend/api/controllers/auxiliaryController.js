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

const getClientRuntimeConfig = async (req, res) => {
    try {
        return res.json({
            youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
            youtubeClientId: process.env.YOUTUBE_CLIENT_ID || ''
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { getCountry, getClientRuntimeConfig };
