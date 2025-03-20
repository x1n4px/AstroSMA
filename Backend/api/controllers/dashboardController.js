const pool = require('../database/connection');
require('dotenv').config();

const getGeneral = async (req, res) => {
    try {
        const option = parseInt(req.query.option); // Obtener la opción del query y convertirla a entero
        let limit;

        switch (option) {
            case 1:
                limit = 10;
                break;
            case 2:
                limit = 25;
                break;
            case 3: // Corregido: opción 3 para 50 registros
                limit = 50;
                break;
            default:
                limit = null; // Sin límite para el caso por defecto
        }

        let query = 'select iz.*, eo.e from Informe_Z iz join Elementos_Orbitales eo on eo.Informe_Z_IdInforme = iz.IdInforme ORDER BY IdInforme DESC';
        if (limit) {
            query += ' LIMIT ?';
            const [data] = await pool.query(query, [limit]);
            res.json({ data });
        } else {
            const [data] = await pool.query(query); // Sin límite
            res.json({ data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getGeneral };