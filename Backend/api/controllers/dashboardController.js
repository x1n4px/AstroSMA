const pool = require('../database/connection');
require('dotenv').config();
const { transform, convertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');
const { convertCoordinates } = require('../middlewares/convertCoordinates');

const getGeneral = async (req, res) => {
  try {
    const option = parseInt(req.query.option);
    let limit;
    let dateFilterValue = '';

    // Configurar límite o filtro de fecha según la opción
    switch (option) {
      case 1: limit = 10; break;
      case 2: limit = 25; break;
      case 3: limit = 50; break;
      case 4: dateFilterValue = getDateFilter(-6, 'months'); break;
      case 5: dateFilterValue = getDateFilter(-1, 'years'); break;
      case 6: dateFilterValue = getDateFilter(-5, 'years'); break;
      default: limit = null;
    }

    

    // Consultas comunes que no dependen del límite/fecha
    const commonQueries = {
      monthObservationsFrequency: `SELECT DATE_FORMAT(Fecha, '%Y-%m') AS mes_anio, COUNT(*) AS total_observaciones FROM Informe_Z GROUP BY mes_anio ORDER BY mes_anio DESC LIMIT 12`,
      hourWithMoreDetection: `SELECT CAST(Hora AS UNSIGNED) AS hora_numerica, COUNT(*) AS total_meteoros, (CAST(Hora AS UNSIGNED) / 24) * 360 AS angulo FROM Informe_Z GROUP BY hora_numerica ORDER BY hora_numerica`,
      observatory: 'SELECT * FROM Observatorio',
      showerPerYear: `SELECT la.Lluvia_Año, la.Lluvia_Identificador, COUNT(*) AS Cantidad_Lluvias, MONTH(iz.Fecha) as Mes FROM Informe_Z iz JOIN Lluvia_activa la ON la.Informe_Z_IdInforme = iz.IdInforme GROUP BY la.Lluvia_Año, la.Lluvia_Identificador ORDER BY la.Lluvia_Año, la.Lluvia_Identificador`,
      lastReportMap: `SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha, iz.Hora FROM Informe_Z iz ORDER BY iz.IdInforme DESC LIMIT 1`,
      lastReport: `SELECT iz.* FROM Informe_Z iz ORDER BY iz.Fecha DESC, iz.Hora DESC LIMIT 1`,
      counterReport: `SELECT 'Informe_Z' AS Tabla, COUNT(*) AS Total FROM Informe_Z
                      UNION ALL
                      SELECT 'Informe_Radiante', COUNT(*) FROM Informe_Radiante
                      UNION ALL
                      SELECT 'Informe_Fotometria', COUNT(*) FROM Informe_Fotometria
                      UNION ALL
                      SELECT 'Meteoro', COUNT(*) FROM Meteoro; `,
      percentageFromLastBolideMonth: `SELECT 
                                        curr.anio AS year,
                                        curr.mes AS month,
                                        curr.num_detections AS current_detections,
                                        prev.num_detections AS previous_month_detections,
                                        ROUND(IF(prev.num_detections = 0, NULL, ((curr.num_detections - prev.num_detections) / prev.num_detections) * 100), 2) AS percentage_change
                                    FROM (
                                        SELECT YEAR(Fecha) AS anio,MONTH(Fecha) AS mes,COUNT(*) AS num_detections
                                        FROM Meteoro
                                        WHERE YEAR(Fecha) = (SELECT YEAR(MAX(Fecha)) FROM Meteoro) AND MONTH(Fecha) = (SELECT MONTH(MAX(Fecha)) FROM Meteoro WHERE YEAR(Fecha) = (SELECT YEAR(MAX(Fecha)) FROM Meteoro))
                                        GROUP BY YEAR(Fecha), MONTH(Fecha)
                                    ) AS curr
                                    LEFT JOIN (
                                        SELECT  YEAR(Fecha) AS anio, MONTH(Fecha) AS mes, COUNT(*) AS num_detections FROM Meteoro GROUP BY YEAR(Fecha), MONTH(Fecha)
                                    ) AS prev
                                    ON (curr.anio = prev.anio AND curr.mes = prev.mes + 1)
                                    OR (curr.anio = prev.anio + 1 AND curr.mes = 1 AND prev.mes = 12);`,
      curvePercentageGroupLastYearBolido: `SELECT curr.year, curr.month, curr.num_detections, prev.num_detections AS previous_month_detections,
                                           ROUND(IF(prev.num_detections = 0, NULL, ((curr.num_detections - prev.num_detections) / prev.num_detections) * 100), 2 ) AS percentage_change
                                           FROM ( SELECT YEAR(Fecha) AS year,MONTH(Fecha) AS month,COUNT(*) AS num_detections FROM Informe_Z GROUP BY YEAR(Fecha), MONTH(Fecha) ) AS curr
                                           LEFT JOIN ( SELECT YEAR(Fecha) AS year, MONTH(Fecha) AS month, COUNT(*) AS num_detections FROM Informe_Z GROUP BY YEAR(Fecha), MONTH(Fecha)) AS prev
                                          ON (curr.year = prev.year AND curr.month = prev.month + 1) OR (curr.year = prev.year + 1 AND curr.month = 1 AND prev.month = 12)
                                          ORDER BY curr.year DESC, curr.month DESC;`
    };

    // Consultas que dependen de límite o fecha
    const dynamicQueries = {
      barChart: option < 4
        ? `SELECT RangoVelocidad, COUNT(*) AS Total FROM (
            SELECT CASE 
              WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" 
              WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" 
              WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" 
              WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" 
              WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" 
              ELSE "Otros" END AS RangoVelocidad
            FROM Informe_Z LIMIT ?) AS subquery GROUP BY RangoVelocidad`
        : `SELECT CASE 
              WHEN Velocidad_media BETWEEN 10 AND 30 THEN "10 - 30 km / s" 
              WHEN Velocidad_media BETWEEN 31 AND 50 THEN "31 - 50 km / s" 
              WHEN Velocidad_media BETWEEN 51 AND 70 THEN "51-70 km/s" 
              WHEN Velocidad_media BETWEEN 71 AND 90 THEN "71-90 km/s" 
              WHEN Velocidad_media BETWEEN 91 AND 110 THEN "91-110 km/s" 
              ELSE "Otros" END AS RangoVelocidad, COUNT(*) AS Total 
            FROM Informe_Z iz ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""} 
            GROUP BY RangoVelocidad`,

      pieChart: `SELECT COUNT(*) as cantidad_meteoros, ocurrencias
                FROM (
                    SELECT m.Identificador, COUNT(*) as ocurrencias
                    FROM Meteoro m
                    JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                  ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                  GROUP BY m.Identificador
                    HAVING COUNT(*) >= 1
                  ${option < 4 ? "LIMIT ?" : ""}
                ) AS conteo_meteoros
                GROUP BY ocurrencias
                ORDER BY ocurrencias;`,


      predictableImpact: `SELECT IdInforme , Inicio_de_la_trayectoria_Estacion_1 , Fin_de_la_trayectoria_Estacion_1 , Inicio_de_la_trayectoria_Estacion_2 , Fin_de_la_trayectoria_Estacion_2, Fecha, Hora  , Meteoro_Identificador 
                          FROM Informe_Z iz
                          GROUP BY Meteoro_Identificador 
                            ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                          ORDER BY Fecha DESC
                          ${option < 4 ? "LIMIT ?" : ""};
                          `,

      lastNMeteors: `SELECT  iz.Fecha, iz.Hora, FALSE AS isRadiant, iz.Meteoro_Identificador, iz.IdInforme
                      FROM Informe_Z iz
                      WHERE iz.Meteoro_Identificador IN (SELECT Identificador FROM ( SELECT Identificador FROM Meteoro ${option >= 4 ? "WHERE Fecha >= ?" : ""} ORDER BY Fecha DESC ${option < 4 ? "LIMIT ?" : ""}) AS ultimos)
                      UNION ALL
                      SELECT ir.Fecha, ir.Hora, TRUE AS isRadiant, ir.Meteoro_Identificador, ir.Identificador
                      FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador IN ( SELECT Identificador FROM ( SELECT Identificador FROM Meteoro ${option >= 4 ? "WHERE Fecha >= ?" : ""} ORDER BY Fecha DESC ${option < 4 ? "LIMIT ?" : ""} ) AS ultimos )
                      ORDER BY Fecha DESC,Hora DESC; `
    };

    // Ejecutar todas las consultas
    const queryParams = option < 4 ? [limit, limit] : [dateFilterValue, dateFilterValue];
    const queryPromises = {
      // Consultas comunes
      ...Object.fromEntries(
        Object.entries(commonQueries).map(([key, query]) =>
          [key, pool.query(query)]
        )
      ),

      // Consultas dinámicas
      barChartData: pool.query(dynamicQueries.barChart, queryParams),
      pieChartData: pool.query(dynamicQueries.pieChart, queryParams),
      predictableImpact: pool.query(dynamicQueries.predictableImpact, queryParams),
      lastNMeteors: pool.query(dynamicQueries.lastNMeteors, queryParams),
    };

    // Esperar todas las consultas
    const results = await Promise.all(Object.values(queryPromises));
    const data = Object.fromEntries(
      Object.keys(queryPromises).map((key, i) => [key, results[i][0]])
    );

    // Procesar los datos
    const processedData = {
      barChartData: data.barChartData,
      pieChartData: data.pieChartData,
      monthObservationsFrequency: data.monthObservationsFrequency,
      hourWithMoreDetection: data.hourWithMoreDetection,
      impactMapFormat: formatImpactMap(data.predictableImpact),
      lastNMeteors: data.lastNMeteors,
      observatoryDataFormatted: data.observatory.map(transform),
      lastReportMap: formatLastReportMap(data.lastReportMap),
      showerPerYearData: data.showerPerYear,
      processedLastReport: processLastReport(data.lastReport)[0],
      counterReport: data.counterReport,
      percentageFromLastBolideMonth: data.percentageFromLastBolideMonth[0],
      curvePercentageGroupLastYearBolido: data.curvePercentageGroupLastYearBolido,
    };

    res.json(processedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------------------------------

const getGeneralHome = async (req, res) => {
  try {

    // Configuración por defecto: últimos 30 días
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const dateFilterValue = oneMonthAgo.toISOString().split('T')[0];

     const [lastReportMap] = await pool.query(`SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha FROM Informe_Z iz ORDER BY iz.IdInforme  DESC LIMIT 1;`);
    const [lastReport] = await pool.query(`SELECT iz.* FROM Informe_Z iz ORDER BY iz.Fecha DESC LIMIT 1;`);
    const [counterReport] = await pool.query(`SELECT 'Informe_Z' AS Tabla, COUNT(*) AS Total FROM Informe_Z
                                              UNION ALL
                                              SELECT 'Informe_Radiante', COUNT(*) FROM Informe_Radiante
                                              UNION ALL
                                              SELECT 'Informe_Fotometria', COUNT(*) FROM Informe_Fotometria
                                              UNION ALL
                                              SELECT 'Meteoro', COUNT(*) FROM Meteoro;
                                              `);
    const [meteorLastYear] = await pool.query(`SELECT 
                                              DATE_FORMAT(Fecha, '%Y-%m') AS mes,
                                              COUNT(*) AS total
                                            FROM Meteoro
                                            WHERE Fecha >= DATE_SUB(
                                                (SELECT MAX(Fecha) FROM Meteoro), 
                                                INTERVAL 12 MONTH
                                            )
                                            GROUP BY DATE_FORMAT(Fecha, '%Y-%m')
                                            ORDER BY mes DESC;
                                                `);
    const [stations] = await pool.query('SELECT * FROM Observatorio');
    const convertedStations = transform(stations);
    res.json({
      lastReportMap: formatLastReportMap(lastReportMap),
      processedReports: processLastReport(lastReport)[0],
      counterReport,
      meteorLastYear,
      stations: convertedStations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Funciones auxiliares
function getDateFilter(value, unit) {
  const date = new Date();
  if (unit === 'months') date.setMonth(date.getMonth() + value);
  if (unit === 'years') date.setFullYear(date.getFullYear() + value);
  return date.toISOString().split('T')[0];
}

function formatImpactMap(impactData) {
  return impactData.map(item => ({
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
  }));
}

function formatLastReportMap(lastReportData) {
  return lastReportData.map(item => ({
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
  }));
}

function processLastReport(reportData) {
  return reportData.map(report => ({
    ...report,
    Inicio_de_la_trayectoria_Estacion_1: convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_1),
    Fin_de_la_trayectoria_Estacion_1: convertCoordinates(report.Fin_de_la_trayectoria_Estacion_1),
    Inicio_de_la_trayectoria_Estacion_2: convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_2),
    Fin_de_la_trayectoria_Estacion_2: convertCoordinates(report.Fin_de_la_trayectoria_Estacion_2),
    Impacto_previsible: convertCoordinates(report.Impacto_previsible + " 0.0 0.0", false)
  }));
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


module.exports = { getGeneral, getGeneralHome };