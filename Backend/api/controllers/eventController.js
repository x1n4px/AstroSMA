const pool = require('../database/connection');
require('dotenv').config();

const getNextEvent = async (req, res) => {
    try {

        const [rows] = await pool.query(`SELECT event_date, description FROM event_config WHERE active = '1' LIMIT 1`);
        if (rows.length > 0) {
            res.json({ eventDate: rows[0].event_date, description: rows[0].description });
        } else {
            res.status(404).json({ message: 'Fecha del evento no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getNextEvent };