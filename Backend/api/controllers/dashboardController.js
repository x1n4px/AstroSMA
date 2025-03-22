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

        //let query = 'select iz.*, eo.e from Informe_Z iz join Elementos_Orbitales eo on eo.Informe_Z_IdInforme = iz.IdInforme ORDER BY IdInforme DESC';
        let barChartQuery = 'SELECT CASE  WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" ELSE "Otros" END AS RangoVelocidad,COUNT(*) AS Total FROM Informe_Z GROUP BY RangoVelocidad'
        if (limit) {
            //query += ' LIMIT ?';
            //const [data] = await pool.query(query, [limit]);

            barChartQuery += ' LIMIT ?';
            pieChartQuery = 'WITH Fotometria AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Fotometria LIMIT ?), Radiante AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Radiante LIMIT ?), InformeZ AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Z LIMIT ?) SELECT (SELECT COUNT(*) FROM Fotometria) AS Meteoros_Fotometria, (SELECT COUNT(*) FROM Radiante) AS Meteoros_Radiante, (SELECT COUNT(*) FROM InformeZ) AS Meteoros_Z;';
            const [pieChartData] = await pool.query(pieChartQuery, [limit, limit, limit]);
            const [barChartData] = await pool.query(barChartQuery, [limit]);
            const [groupChartDataUnformat] = await pool.query('(SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) UNION ALL (SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) UNION ALL (SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, AVG(iz.Error_distancia_Estacion_2) AS Error_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?)', [limit, limit, limit]);
            const groupChartData = formatGroupBarChartData(groupChartDataUnformat);
            res.json({barChartData, pieChartData, groupChartData });

        } else {
            //const [data] = await pool.query(query); // Sin límite
            const [barChartData] = await pool.query(barChartQuery);
            const [pieChartData] = await pool.query('WITH Fotometria AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Fotometria), Radiante AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Radiante), InformeZ AS (SELECT DISTINCT Meteoro_Identificador FROM Informe_Z) SELECT (SELECT COUNT(*) FROM Fotometria) AS Meteoros_Fotometria, (SELECT COUNT(*) FROM Radiante) AS Meteoros_Radiante, (SELECT COUNT(*) FROM InformeZ) AS Meteoros_Z;');
            const [groupChartDataUnformat] = await pool.query('SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 FROM Informe_Z iz UNION ALL SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 FROM Informe_Z iz UNION ALL SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, AVG(iz.Error_distancia_Estacion_2) AS Error_2 FROM Informe_Z iz;', [limit]);
            const groupChartData = formatGroupBarChartData(groupChartDataUnformat);
            res.json({ barChartData, pieChartData, groupChartData });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const formatGroupBarChartData = (data) => {
    // Transforma los datos en formato adecuado para las barras agrupadas
    const formattedData = [
      {
        group: "Distancia",
        Distancia_1: parseFloat(data[0].Distancia_1),
        Distancia_2: parseFloat(data[0].Distancia_2),
      },
      {
        group: "Tiempo",
        Distancia_1: parseFloat(data[1].Distancia_1),
        Distancia_2: parseFloat(data[1].Distancia_2),
      },
      {
        group: "Error",
        Distancia_1: parseFloat(data[2].Distancia_1),
        Distancia_2: parseFloat(data[2].Distancia_2),
      },
    ];
  
    return formattedData;
  };
  

module.exports = { getGeneral };