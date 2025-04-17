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

const getNextShower = async (req, res) => {
    try {
        const [shower] = await pool.query(`SELECT *
FROM Lluvia l
INNER JOIN (
    SELECT Identificador, MAX(Año) AS AñoMax
    FROM Lluvia
    GROUP BY Identificador
) latest
ON l.Identificador = latest.Identificador AND l.Año = latest.AñoMax
WHERE (
    CURDATE() BETWEEN l.Fecha_Inicio AND l.Fecha_Fin
    OR
    ABS(DATEDIFF(
        STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(l.Fecha_Inicio), '-', DAY(l.Fecha_Inicio)), '%Y-%m-%d'),
        CURDATE()
    )) <= 15
    OR
    ABS(DATEDIFF(
        STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(l.Fecha_Fin), '-', DAY(l.Fecha_Fin)), '%Y-%m-%d'),
        CURDATE()
    )) <= 15
)
ORDER BY l.Año DESC;`);
        res.json({shower});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllShower, getNextShower };