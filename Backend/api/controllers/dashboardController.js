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
      monthObservationsFrequency: `SELECT DATE_FORMAT(Fecha, '%Y-%m') AS mes_anio, COUNT(*) AS total_observaciones 
                                 FROM Informe_Z GROUP BY mes_anio ORDER BY mes_anio DESC LIMIT 12`,
      meteorInflowAzimuthDistribution: `SELECT FLOOR(Azimut / 10) * 10 AS azimut_agrupado, COUNT(*) AS cantidad 
                                      FROM Informe_Z GROUP BY azimut_agrupado ORDER BY azimut_agrupado`,
      hourWithMoreDetection: `SELECT CAST(Hora AS UNSIGNED) AS hora_numerica, COUNT(*) AS total_meteoros, 
                            (CAST(Hora AS UNSIGNED) / 24) * 360 AS angulo FROM Informe_Z 
                            GROUP BY hora_numerica ORDER BY hora_numerica`,
      observatory: 'SELECT * FROM Observatorio',
      showerPerYear: `SELECT la.Lluvia_Año, la.Lluvia_Identificador, COUNT(*) AS Cantidad_Lluvias, 
                     MONTH(iz.Fecha) as Mes FROM Informe_Z iz JOIN Lluvia_activa la 
                     ON la.Informe_Z_IdInforme = iz.IdInforme GROUP BY la.Lluvia_Año, 
                     la.Lluvia_Identificador ORDER BY la.Lluvia_Año, la.Lluvia_Identificador`,
      lastReportMap: `SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, 
                     iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, 
                     iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha, iz.Hora 
                     FROM Informe_Z iz ORDER BY iz.IdInforme DESC LIMIT 1`,
      lastReport: `SELECT iz.* FROM Informe_Z iz ORDER BY iz.Fecha DESC, iz.Hora DESC LIMIT 1`
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

      pieChart: `WITH conteo_meteoros AS (
                  SELECT m.Identificador, COUNT(*) as ocurrencias
                  FROM Meteoro m
                  JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
                  ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                  GROUP BY m.Identificador
                  HAVING COUNT(*) >= 1
                  ${option < 4 ? "LIMIT ?" : ""}
                )
                SELECT COUNT(*) as cantidad_meteoros, ocurrencias
                FROM conteo_meteoros
                GROUP BY ocurrencias
                ORDER BY ocurrencias`,

      groupChart: option < 4
        ? `(SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, 
            SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) 
            UNION ALL 
            (SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, 
            SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?) 
            UNION ALL 
            (SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, 
            AVG(iz.Error_distancia_Estacion_2) AS Error_2 FROM Informe_Z iz GROUP BY Categoria LIMIT ?)`
        : `SELECT "Distancia" AS Categoria, SUM(iz.Distancia_recorrida_Estacion_1) AS Distancia_1, 
            SUM(iz.Distancia_recorrida_Estacion_2) AS Distancia_2 FROM Informe_Z iz 
            ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
            UNION ALL 
            SELECT "Tiempo" AS Categoria, SUM(iz.Tiempo_Estacion_1) AS Tiempo_1, 
            SUM(iz.Tiempo_trayectoria_en_estacion_2) AS Tiempo_2 FROM Informe_Z iz 
            ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
            UNION ALL 
            SELECT "Error" AS Categoria, AVG(iz.Error_distancia_Estacion_1) AS Error_1, 
            AVG(iz.Error_distancia_Estacion_2) AS Error_2 FROM Informe_Z iz 
            ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}`,

      // Otras consultas dinámicas...
      relationBtwTrajectoryAngleAndDistance: `SELECT Ángulo_diedro_entre_planos_trayectoria as angle, 
                                            (Distancia_recorrida_Estacion_1 + Distancia_recorrida_Estacion_2) / 2 AS averageDistance 
                                            FROM Informe_Z WHERE Distancia_recorrida_Estacion_1 IS NOT NULL 
                                            AND Distancia_recorrida_Estacion_2 IS NOT NULL 
                                            ${option >= 4 ? "AND Fecha >= ?" : ""}
                                            ${option < 4 ? "LIMIT ?" : ""}`,

      predictableImpact: `WITH Ranked AS (
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
                          ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                          )
                          SELECT 
                              Identificador, 
                              Inicio_de_la_trayectoria_Estacion_1,
                              Inicio_de_la_trayectoria_Estacion_2,
                              Fin_de_la_trayectoria_Estacion_1,
                              Fin_de_la_trayectoria_Estacion_2,
                              Fecha
                          FROM Ranked
                          WHERE rn = 1 AND (Inicio_de_la_trayectoria_Estacion_1 NOT LIKE 'No medido' 
                          AND Inicio_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido' 
                          AND Fin_de_la_trayectoria_Estacion_1 NOT LIKE 'No medido' 
                          AND Fin_de_la_trayectoria_Estacion_2 NOT LIKE 'No medido')
                          ORDER BY Ángulo_diedro_entre_planos_trayectoria DESC
                          ${option < 4 ? "LIMIT ?" : ""}`,

      excentricitiesOverNinety: `SELECT iz.IdInforme, iz.Fecha, iz.Hora, eo.e 
                               FROM Informe_Z iz JOIN Elementos_Orbitales eo 
                               ON eo.Informe_Z_IdInforme = iz.IdInforme 
                               WHERE CAST(SUBSTRING_INDEX(eo.e, ' ', 1) AS DECIMAL(10,8)) > 0.9 
                               ${option >= 4 ? "AND iz.Fecha >= ?" : ""}
                               ${option < 4 ? "LIMIT ?" : ""}`,

      distanceWithErrorFromObservatory: `SELECT iz.Observatorio_Número, iz.Distancia_recorrida_Estacion_1, 
                                       iz.Error_distancia_Estacion_1 FROM Informe_Z iz 
                                       ${option >= 4 ? "WHERE iz.Fecha >= ?" : ""}
                                       ${option < 4 ? "LIMIT ?" : ""}`,

      velocityDispersionVersusDihedralAngle: `SELECT Ángulo_diedro_entre_planos_trayectoria AS angle, 
                                            Velocidad_media as averageDistance FROM Informe_Z 
                                            ${option >= 4 ? "WHERE Fecha >= ?" : ""}
                                            ${option < 4 ? "LIMIT ?" : ""}`
    };

    // Ejecutar todas las consultas
    const queryParams = option < 4 ? [limit] : [dateFilterValue];
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
      groupChartDataUnformat: option < 4
        ? pool.query(dynamicQueries.groupChart, [limit, limit, limit])
        : pool.query(dynamicQueries.groupChart, [dateFilterValue, dateFilterValue, dateFilterValue]),
      relationBtwTrajectoryAngleAndDistance: pool.query(
        dynamicQueries.relationBtwTrajectoryAngleAndDistance, queryParams
      ),
      predictableImpact: pool.query(dynamicQueries.predictableImpact, queryParams),
      excentricitiesOverNinety: pool.query(dynamicQueries.excentricitiesOverNinety, queryParams),
      distanceWithErrorFromObservatory: pool.query(
        dynamicQueries.distanceWithErrorFromObservatory, queryParams
      ),
      velocityDispersionVersusDihedralAngle: pool.query(
        dynamicQueries.velocityDispersionVersusDihedralAngle, queryParams
      )
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
      groupChartData: formatGroupBarChartData(data.groupChartDataUnformat),
      monthObservationsFrequency: data.monthObservationsFrequency,
      meteorInflowAzimuthDistribution: data.meteorInflowAzimuthDistribution,
      relationBtwTrajectoryAngleAndDistance: data.relationBtwTrajectoryAngleAndDistance,
      hourWithMoreDetection: data.hourWithMoreDetection,
      impactMapFormat: formatImpactMap(data.predictableImpact),
      excentricitiesOverNinety: data.excentricitiesOverNinety,
      lastReport: data.lastReport,
      distanceWithErrorFromObservatory: data.distanceWithErrorFromObservatory,
      velocityDispersionVersusDihedralAngle: data.velocityDispersionVersusDihedralAngle,
      observatoryDataFormatted: data.observatory.map(transform),
      lastReportMap: formatLastReportMap(data.lastReportMap),
      showerPerYearData: data.showerPerYear,
      processedLastReport: processLastReport(data.lastReport)
    };

    res.json(processedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};



const getGeneralHome = async (req, res) => {
  try {

    // Configuración por defecto: últimos 30 días
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const dateFilterValue = oneMonthAgo.toISOString().split('T')[0];

    const lastReportMapQuery = `SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha FROM Informe_Z iz ORDER BY iz.IdInforme  DESC LIMIT 1;`;
    const [lastReportMapUNF] = await pool.query(lastReportMapQuery);
    const [lastReport] = await pool.query(`SELECT iz.* FROM Informe_Z iz ORDER BY iz.Fecha DESC LIMIT 1;`);
    const [counterReport] = await pool.query(`SELECT 'Informe_Z' AS Tabla, COUNT(*) AS Total FROM Informe_Z
                                              UNION ALL
                                              SELECT 'Informe_Radiante', COUNT(*) FROM Informe_Radiante
                                              UNION ALL
                                              SELECT 'Informe_Fotometria', COUNT(*) FROM Informe_Fotometria
                                              UNION ALL
                                              SELECT 'Meteoro', COUNT(*) FROM Meteoro;
                                              `);
 


    res.json({
      lastReportMap: formatLastReportMap(lastReportMapUNF),
      processedReports: processLastReport(lastReport),
      counterReport
    });
  } catch (error) {
    console.log(error);
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