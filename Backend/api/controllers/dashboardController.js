const pool = require('../database/connection');
require('dotenv').config();
const { transform, convertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');
const { convertCoordinates } = require('../middlewares/convertCoordinates');



const getGeneral = async (req, res) => {
  try {
    const option = parseInt(req.query.option); // Obtener la opción del query y convertirla a entero
    let limit;
    let dateFilterValue = '';

    switch (option) {
      case 1:
        limit = 10;
        break;
      case 2:
        limit = 25;
        break;
      case 3:
        limit = 50;
        break;
      case 4:
        // Para la opción 4, no usamos límite sino filtro de fecha
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        dateFilterValue = sixMonthsAgo.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
        console.log(dateFilterValue)
        break;
      case 5:
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        dateFilterValue = oneYearAgo.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
        break;
      case 6:
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        dateFilterValue = fiveYearsAgo.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
      default:
        limit = null; // Sin límite para el caso por defecto
    }





    if (option < 4 && limit) {
      // Casos con límite (opciones 1, 2, 3)
      let barChartQuery = `SELECT RangoVelocidad, COUNT(*) AS Total
                          FROM (
                              SELECT CASE 
                                  WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" 
                                  WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" 
                                  WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" 
                                  WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" 
                                  WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" 
                                  ELSE "Otros" 
                              END AS RangoVelocidad
                              FROM Informe_Z 
                              LIMIT ?
                          ) AS subquery
                          GROUP BY RangoVelocidad;`;

      const pieChartQuery = `WITH conteo_meteoros AS (
                              SELECT m.Identificador, COUNT(*) as ocurrencias
                              FROM Meteoro m
                              JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                              GROUP BY m.Identificador
                              HAVING COUNT(*) >= 1
                              LIMIT ?
                              )
                              SELECT COUNT(*) as cantidad_meteoros, ocurrencias
                              FROM conteo_meteoros
                              GROUP BY ocurrencias
                              ORDER BY ocurrencias;`;

      const groupChartQuery = `(SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, 
                                  SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) 
                                  UNION ALL 
                                  (SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, 
                                  SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) 
                                  UNION ALL 
                                  (SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, 
                                  AVG(iz.Error_distancia_Estacion_2) AS Error_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?)`;


      const monthObservationsFrequencyQuery = `SELECT DATE_FORMAT(Fecha, '%Y-%m') AS mes_anio, COUNT(*) AS total_observaciones FROM Informe_Z GROUP BY mes_anio ORDER BY mes_anio DESC LIMIT 12`


      const meteorInflowAzimuthDistributionQuery = `SELECT FLOOR(Azimut / 10) * 10 AS azimut_agrupado, COUNT(*) AS cantidad FROM Informe_Z GROUP BY azimut_agrupado ORDER BY azimut_agrupado;`

      const relationBtwTrajectoryAngleAndDistanceQuery = `SELECT Ángulo_diedro_entre_planos_trayectoria as angle, (Distancia_recorrida_Estacion_1 + Distancia_recorrida_Estacion_2) / 2 AS averageDistance FROM Informe_Z WHERE Distancia_recorrida_Estacion_1 IS NOT NULL AND Distancia_recorrida_Estacion_2 IS NOT NULL LIMIT ?`
      const hourWithMoreDetectionQuery = `SELECT CAST(Hora AS UNSIGNED) AS hora_numerica, COUNT(*) AS total_meteoros, (CAST(Hora AS UNSIGNED) / 24) * 360 AS angulo FROM Informe_Z GROUP BY hora_numerica ORDER BY hora_numerica; `
      const predictableImpactQuery = `WITH Ranked AS (
                                      SELECT 
                                          m.Identificador, 
                                          iz.Ángulo_diedro_entre_planos_trayectoria, 
                                          iz.Inicio_de_la_trayectoria_Estacion_1,
                                          iz.Inicio_de_la_trayectoria_Estacion_2,
                                          iz.Fin_de_la_trayectoria_Estacion_1,
                                          iz.Fin_de_la_trayectoria_Estacion_2,
                                          ROW_NUMBER() OVER (
                                              PARTITION BY m.Identificador 
                                              ORDER BY iz.Ángulo_diedro_entre_planos_trayectoria DESC
                                          ) AS rn
                                      FROM Meteoro m
                                      JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                                  )
                                  SELECT 
                                      Identificador, 
                                      Inicio_de_la_trayectoria_Estacion_1,
                                      Inicio_de_la_trayectoria_Estacion_2,
                                      Fin_de_la_trayectoria_Estacion_1,
                                      Fin_de_la_trayectoria_Estacion_2
                                  FROM Ranked
                                  WHERE rn = 1 AND (Inicio_de_la_trayectoria_Estacion_1 NOT LIKE 'No medido' AND Inicio_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido' AND Fin_de_la_trayectoria_Estacion_1  NOT LIKE 'No medido' AND Fin_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido')
                                  ORDER BY Ángulo_diedro_entre_planos_trayectoria DESC
                                  LIMIT ?;`
      const excentricitiesOverNinetyQuery = `SELECT iz.IdInforme,iz.Fecha, iz.Hora, eo.e FROM Informe_Z iz JOIN Elementos_Orbitales eo ON eo.Informe_Z_IdInforme = iz.IdInforme WHERE CAST(SUBSTRING_INDEX(eo.e, ' ', 1) AS DECIMAL(10,8)) > 0.9 LIMIT ?`
      const lastReportQuery = `SELECT iz.IdInforme, iz.Fecha, iz.Hora FROM Informe_Z iz ORDER BY iz.Fecha DESC, iz.Hora DESC LIMIT ?;`
      const distanceWithErrorFromObservatoryQuery = `SELECT iz.Observatorio_Número , iz.Distancia_recorrida_Estacion_1, iz.Error_distancia_Estacion_1 FROM Informe_Z iz LIMIT ?;`
      const velocityDispersionVersusDihedralAngleQuery = `SELECT Ángulo_diedro_entre_planos_trayectoria AS angle, Velocidad_media as averageDistance FROM Informe_Z LIMIT ?`;
      const lastReportMapQuery = `SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha, iz.Hora FROM Informe_Z iz ORDER BY iz.IdInforme  DESC LIMIT 1;`;


      const observatory = 'SELECT * FROM Observatorio o ;'


      const [pieChartData] = await pool.query(pieChartQuery, [limit]);
      const [barChartData] = await pool.query(barChartQuery, [limit]);
      const [groupChartDataUnformat] = await pool.query(groupChartQuery, [limit, limit, limit]);

      const [monthObservationsFrequency] = await pool.query(monthObservationsFrequencyQuery);
      const [meteorInflowAzimuthDistribution] = await pool.query(meteorInflowAzimuthDistributionQuery);
      const [relationBtwTrajectoryAngleAndDistance] = await pool.query(relationBtwTrajectoryAngleAndDistanceQuery, [limit]);
      const [hourWithMoreDetection] = await pool.query(hourWithMoreDetectionQuery);
      const [predictableImpact] = await pool.query(predictableImpactQuery, [limit]);
      const [excentricitiesOverNinety] = await pool.query(excentricitiesOverNinetyQuery, [limit]);
      const [lastReport] = await pool.query(lastReportQuery, [limit]);
      const [distanceWithErrorFromObservatory] = await pool.query(distanceWithErrorFromObservatoryQuery, [limit]);
      const [velocityDispersionVersusDihedralAngle] = await pool.query(velocityDispersionVersusDihedralAngleQuery, [limit]);
      const [observatoryData] = await pool.query(observatory);
      const [lastReportMapUNF] = await pool.query(lastReportMapQuery);

      const lastReportMap = lastReportMapUNF.map((item) => {
        return {
          AUX: {
            Fecha: item.Fecha,
            Hora: item.Hora,
            IdInforme: item.IdInforme
          },
          MAP_DATA: {
            st1: {
              start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_1, false),
              end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_1, false),
              id: item.IdInforme
            },
            st2: {
              start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_2, false),
              end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_2, false),
              id: item.IdInforme
            }
          }
          
        }
      })

      const impactMapFormat = predictableImpact.map((item) => {
        return {

          st1: {
            start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_1, false),
            end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_1, false),
            id: item.Identificador
          },
          st2: {
            start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_2, false),
            end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_2, false),
            id: item.Identificador
          }
        }
      })


      const observatoryDataFormatted = observatoryData.map(transform);



      const groupChartData = formatGroupBarChartData(groupChartDataUnformat);


      res.json({
        barChartData,
        pieChartData,
        groupChartData,
        monthObservationsFrequency,
        meteorInflowAzimuthDistribution,
        relationBtwTrajectoryAngleAndDistance,
        hourWithMoreDetection,
        impactMapFormat,
        excentricitiesOverNinety,
        lastReport,
        distanceWithErrorFromObservatory,
        velocityDispersionVersusDihedralAngle,
        observatoryDataFormatted,
        lastReportMap
      });
    } else {
      // Casos sin límite (opción 4 o default)

      let barChartQuery = `SELECT CASE 
      WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" 
      WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" 
      WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" 
      WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" 
      WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" 
      ELSE "Otros" END AS RangoVelocidad, COUNT(*) AS Total 
      FROM Informe_Z iz 
      WHERE iz.Fecha >= ?
      GROUP BY RangoVelocidad`;


      const pieChartQuery = `WITH conteo_meteoros AS (
                              SELECT m.Identificador, COUNT(*) as ocurrencias
                              FROM Meteoro m
                              JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                              ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                              GROUP BY m.Identificador
                              HAVING COUNT(*) >= 1
                              )
                              SELECT COUNT(*) as cantidad_meteoros, ocurrencias
                              FROM conteo_meteoros
                              GROUP BY ocurrencias
                              ORDER BY ocurrencias;`;

      const groupChartQuery = `SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, 
                                  SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 
                         FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""} 
                         UNION ALL 
                         SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, 
                                SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 
                         FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""} 
                         UNION ALL 
                         SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, 
                                AVG(iz.Error_distancia_Estacion_2) AS Error_2 
                         FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}`;
      const monthObservationsFrequencyQuery = `SELECT DATE_FORMAT(Fecha, '%Y-%m') AS mes_anio, COUNT(*) AS total_observaciones FROM Informe_Z GROUP BY mes_anio ORDER BY mes_anio DESC LIMIT 12`
      const meteorInflowAzimuthDistributionQuery = `SELECT FLOOR(Azimut / 10) * 10 AS azimut_agrupado, COUNT(*) AS cantidad FROM Informe_Z GROUP BY azimut_agrupado ORDER BY azimut_agrupado;`
      const relationBtwTrajectoryAngleAndDistanceQuery = `SELECT Ángulo_diedro_entre_planos_trayectoria as angle, (Distancia_recorrida_Estacion_1 + Distancia_recorrida_Estacion_2) / 2 AS averageDistance FROM Informe_Z iz WHERE Distancia_recorrida_Estacion_1 IS NOT NULL AND Distancia_recorrida_Estacion_2 IS NOT NULL ${option >= 4 ? "AND iz.Fecha >= ?" : ""}`
      const hourWithMoreDetectionQuery = `SELECT CAST(Hora AS UNSIGNED) AS hora_numerica, COUNT(*) AS total_meteoros, (CAST(Hora AS UNSIGNED) / 24) * 360 AS angulo FROM Informe_Z GROUP BY hora_numerica ORDER BY hora_numerica; `
      const predictableImpactQuery = `WITH Ranked AS (
                                        SELECT 
                                            m.Identificador, 
                                            iz.Ángulo_diedro_entre_planos_trayectoria, 
                                            iz.Inicio_de_la_trayectoria_Estacion_1,
                                            iz.Inicio_de_la_trayectoria_Estacion_2,
                                            iz.Fin_de_la_trayectoria_Estacion_1,
                                            iz.Fin_de_la_trayectoria_Estacion_2,
                                            iz.Fecha,
                                            ROW_NUMBER() OVER (
                                                PARTITION BY m.Identificador 
                                                ORDER BY iz.Ángulo_diedro_entre_planos_trayectoria DESC
                                            ) AS rn
                                        FROM Meteoro m
                                        JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                                    )
                                    SELECT 
                                        Identificador, 
                                        Inicio_de_la_trayectoria_Estacion_1,
                                        Inicio_de_la_trayectoria_Estacion_2,
                                        Fin_de_la_trayectoria_Estacion_1,
                                        Fin_de_la_trayectoria_Estacion_2,
                                        Fecha
                                    FROM Ranked
                                    WHERE rn = 1 ${option >= 4 ? "AND Fecha >= ?" : ""} AND (Inicio_de_la_trayectoria_Estacion_1 NOT LIKE 'No medido' AND Inicio_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido' AND Fin_de_la_trayectoria_Estacion_1  NOT LIKE 'No medido' AND Fin_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido')
                                    ORDER BY Ángulo_diedro_entre_planos_trayectoria DESC`



      const excentricitiesOverNinetyQuery = `SELECT iz.IdInforme,iz.Fecha, iz.Hora, eo.e FROM Informe_Z iz JOIN Elementos_Orbitales eo ON eo.Informe_Z_IdInforme = iz.IdInforme WHERE CAST(SUBSTRING_INDEX(eo.e, ' ', 1) AS DECIMAL(10,8)) > 0.9 ${option >= 4 ? "AND iz.Fecha >= ?" : ""}`
      const lastReportQuery = `SELECT iz.IdInforme, iz.Fecha, iz.Hora FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""} ORDER BY iz.Fecha DESC, iz.Hora DESC ;`
      const distanceWithErrorFromObservatoryQuery = `SELECT iz.Observatorio_Número , iz.Distancia_recorrida_Estacion_1, iz.Error_distancia_Estacion_1 FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""};`
      const velocityDispersionVersusDihedralAngleQuery = `SELECT Ángulo_diedro_entre_planos_trayectoria AS angle, Velocidad_media as averageDistance FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}`;
      const observatory = 'SELECT * FROM Observatorio o ;'
      const lastReportMapQuery = `SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha FROM Informe_Z iz ORDER BY iz.IdInforme  DESC LIMIT 1;`;


      const [barChartData] = await pool.query(barChartQuery, [dateFilterValue]);
      const [pieChartData] = await pool.query(pieChartQuery, [dateFilterValue]);
      const [groupChartDataUnformat] = await pool.query(groupChartQuery, [dateFilterValue, dateFilterValue, dateFilterValue]);
      const [monthObservationsFrequency] = await pool.query(monthObservationsFrequencyQuery);
      const [meteorInflowAzimuthDistribution] = await pool.query(meteorInflowAzimuthDistributionQuery);
      const [relationBtwTrajectoryAngleAndDistance] = await pool.query(relationBtwTrajectoryAngleAndDistanceQuery, [dateFilterValue]);
      const [hourWithMoreDetection] = await pool.query(hourWithMoreDetectionQuery);
      const [predictableImpact] = await pool.query(predictableImpactQuery, [dateFilterValue]);
      const [excentricitiesOverNinety] = await pool.query(excentricitiesOverNinetyQuery, [dateFilterValue]);
      const [lastReport] = await pool.query(lastReportQuery, [dateFilterValue]);
      const [distanceWithErrorFromObservatory] = await pool.query(distanceWithErrorFromObservatoryQuery, [dateFilterValue]);
      const [velocityDispersionVersusDihedralAngle] = await pool.query(velocityDispersionVersusDihedralAngleQuery, [dateFilterValue]);
      const [observatoryData] = await pool.query(observatory);
      const [lastReportMap] = await pool.query(lastReportMapQuery);

      const impactMapFormat = predictableImpact.map((item) => {
        return {
          st1: {
            start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_1, false),
            end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_1, false),
            id: item.Identificador
          },
          st2: {
            start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_2, false),
            end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_2, false),
            id: item.Identificador
          }
        }
      })

      const observatoryDataFormatted = observatoryData.map(transform);
      const groupChartData = formatGroupBarChartData(groupChartDataUnformat);


      res.json({
        barChartData,
        pieChartData,
        groupChartData,
        monthObservationsFrequency,
        meteorInflowAzimuthDistribution,
        relationBtwTrajectoryAngleAndDistance,
        hourWithMoreDetection,
        impactMapFormat,
        excentricitiesOverNinety,
        lastReport,
        distanceWithErrorFromObservatory,
        velocityDispersionVersusDihedralAngle,
        observatoryDataFormatted,
        lastReportMap
      });
    }
  } catch (error) {
    console.log(error)
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