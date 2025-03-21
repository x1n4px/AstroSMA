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
        let barChartQuery = 'SELECT CASE  WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" ELSE "Otros" END AS RangoVelocidad,COUNT(*) AS Total FROM Informe_Z GROUP BY RangoVelocidad'
        if (limit) {
            query += ' LIMIT ?';
            const [data] = await pool.query(query, [limit]);

            barChartQuery += ' LIMIT ?';
            const [barChartData] = await pool.query(barChartQuery, [limit]);
            res.json({ data, barChartData });


        } else {
            const [data] = await pool.query(query); // Sin límite
            const [barChartData] = await pool.query(barChartQuery);
            res.json({ data, barChartData });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getGeneral };