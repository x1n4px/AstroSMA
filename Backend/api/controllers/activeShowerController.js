const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getAllShower = async (req, res) => {
    try {

        const [shower] = await pool.query('SELECT DISTINCT * FROM Lluvia l GROUP BY Identificador');
        const [IAUShower] = await pool.query('SELECT * FROM meteor_showers')

        res.json({ shower, IAUShower });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getNextShower = async (req, res) => {
    try {
        const [shower] = await pool.query(`
            SELECT *
FROM Lluvia l
INNER JOIN (
    SELECT Identificador, MAX(Año) AS AñoMax
    FROM Lluvia
    GROUP BY Identificador
) latest
ON l.Identificador = latest.Identificador AND l.Año = latest.AñoMax
WHERE (
    -- Día y mes actuales están entre Fecha_Inicio y Fecha_Fin (ignorando el año)
    DATE_FORMAT(CURDATE(), '%m-%d') BETWEEN DATE_FORMAT(l.Fecha_Inicio, '%m-%d') AND DATE_FORMAT(l.Fecha_Fin, '%m-%d')
)
ORDER BY l.Año DESC;
            `);
        res.json({ shower });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllShower, getNextShower };