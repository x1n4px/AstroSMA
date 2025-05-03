const pool = require('../database/connection');

const { isPointInRadius } = require('../middlewares/isPointInRadius')
const { individuaConvertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal.js')

const testing = async (req, res) => {
  try {
    const [meteoros] = await pool.query('select * from Meteoro');
    return res.json(meteoros);
  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


// Función para obtener un empleado por su ID
const getAllBolide = async (req, res) => {
  try {
    const [reports] = await pool.query('SELECT * FROM Informe_Z');
    res.json(reports);
  } catch (error) {
    console.error('Error al obtener las estaciones:', error);
    throw error;
  }
};



const getAllBolideLastSixMonths = async (req, res) => {
  try {
    const filteredData = filterRecentData(data);

    // Obtener los 6 meses más recientes
    const currentMonth = new Date().getMonth(); // Obtener el mes actual
    const monthsRange = Array.from({ length: 6 }, (_, index) => (currentMonth - index + 12) % 12); // Calculamos los últimos 6 meses

    // Los meses deben ordenarse de octubre a marzo
    const sortedMonthsRange = monthsRange.reverse();  // Revertir el orden para empezar por octubre

    // Agrupar por mes y contar registros
    const monthlyCounts = filteredData.reduce((acc, item) => {
      const month = new Date(item.date).getMonth(); // Asegúrate de que 'date' es el campo que contiene la fecha
      if (sortedMonthsRange.includes(month)) {
        if (!acc[month]) {
          acc[month] = 1;
        } else {
          acc[month]++;
        }
      }
      return acc;
    }, {});

    // Crear el array con 0 en los meses que no tienen registros
    const monthlyCountsArray = sortedMonthsRange.map(month => ({
      month: month,
      count: monthlyCounts[month] || 0
    }));

    // Devolver la respuesta con la data filtrada y el nuevo array de conteo por mes
    res.json({
      filteredData,
      monthlyCounts: monthlyCountsArray
    });
  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    throw error;
  }
};





const getBolideById = async (req, res) => {
  try {
    const id = req.params.id;

    const [bolide] = await pool.query('SELECT * FROM Meteoro m WHERE m.Identificador = ?', [id]);
    res.json(bolide);

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    throw error;
  }
};




const getBolideCompareLastTen = async (req, res) => {
  try {
    const [bolide] = await pool.query('SELECT * FROM Meteoro ORDER BY Fecha DESC LIMIT 10;');
    res.json(bolide);
  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    throw error;
  }
};

const getBolideCompareLastTwo = async (req, res) => {
  try {
    const [bolide] = await pool.query('SELECT * FROM Meteoro ORDER BY Fecha DESC LIMIT 2;');
    res.json(bolide);
  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    throw error;
  }
};

const getBolideWithCustomSearch = async (req, res) => {
  try {
    const { heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage, reportType } = req.query;
    const offs = actualPage * 50;
    /*    REPORT_TYPE
        1: "Todos los bólidos sin filtros"
        2: "Bólidos con Informe_Z"
        3: "Bólidos con Informe Radiante"
        4: "Bólidos con Informe Fotometría"
        5: "Bólidos con todos los informes"
    */

    let totalItems = 0;
    let allBolides = []; // Usar let en lugar de const
    let totalItemsResult = [];
    let params = [];
    let query = ``;
    switch (reportType) {
      case '1':
        // Obtener todos los bólidos sin filtros
        query = `
        SELECT m.*, 
          CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ,
          CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant,
          1 AS hasReportPhotometry,
          GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
          GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante,
          GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
        FROM Meteoro m 
        LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
        LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador
        INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador`;
        // Agregar filtro por rango de fechas si está activado
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        // Agregar LIMIT y OFFSET
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);


        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');



        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '2':
        // Obtener todos los bólidos con Informe_Z
        query = `
                  SELECT 
                    m.*, 
                    1 AS hasReportZ, 
                    CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, 
                    CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry,
                    GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
                    GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
                    GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria,
                    iz.Inicio_de_la_trayectoria_Estacion_1,
                    CAST(
                      SUBSTRING_INDEX(
                        SUBSTRING_INDEX(iz.Inicio_de_la_trayectoria_Estacion_1, ' ', 4), 
                        ' ', -1
                      ) AS DECIMAL(10,6)
                    ) AS altura
                  FROM 
                    Meteoro m 
                    INNER JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
                    LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
                    LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador 
                `;

        // Condiciones WHERE dinámicas
        let conditions = [];

        // Filtro por rango de fechas
        if (dateRangeChecked === 'true' && startDate && endDate) {
          conditions.push(`iz.Fecha >= ? AND iz.Fecha <= ?`);
          params.push(startDate, endDate);
        }

        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')} `;
        }

        // Agrupamiento
        query += ` GROUP BY m.Identificador `;

        // Filtro por altura en HAVING
        if (heightChecked === 'true' && heightFilter) {
          query += ` HAVING altura < ? `;
          params.push(heightFilter);
        }

        // Limit y offset
        query += ` LIMIT 50 OFFSET ? `;
        params.push(offs);


        // Ejecutar la consulta
        [allBolides] = await pool.query(query, params);

        console.log(allBolides)

        if ((latLonChecked === 'true' && latFilter && lonFilter && ratioFilter) ||
          (heightChecked === 'true' && heightFilter)) {

          allBolides = allBolides.filter(bolide => {
            const [latDMS, lonDMS, distance, altitude] = bolide.Inicio_de_la_trayectoria_Estacion_1.split(" ");
            const lonF = individuaConvertSexagesimalToDecimal(latDMS);
            const latF = individuaConvertSexagesimalToDecimal(lonDMS);


            const isInRadius = latLonChecked === 'true' && latFilter && lonFilter && ratioFilter
              ? isPointInRadius(latFilter, lonFilter, ratioFilter * 1000, latF, lonF)
              : true;


            return isInRadius;
          });
        }





        [totalItemsResult] = await pool.query(`SELECT 
                                                COUNT(DISTINCT m.Identificador) AS total_meteoros
                                                FROM Meteoro m 
                                                INNER JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
                                                LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
                                                LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador;
                                                `);
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '3':
        // Obtener todos los bólidos con Informe Radiante
        query = `SELECT m.*, 
          CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, 1 AS hasReportRadiant, 
          CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry, 
          GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, 
          GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
          GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
          ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} 
          FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
          INNER JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
          LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador `;
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);
        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Radiante i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '4':
        // Obtener todos los bólidos con Informe Fotometría
        query = `SELECT m.*, 
        CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, 
        CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, 1 AS hasReportPhotometry,
         GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
         GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
         ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} 
         FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
         LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
         INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador `;
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);
        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;

      default:
        // Obtener todos los bólidos sin filtros
        [allBolides] = await pool.query(`SELECT * FROM Meteoro LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro ');
        otalItems = totalItemsResult[0]['count(*)'];
        break;
    }

    if (heightChecked === 'true' && heightFilter) {
      allBolides = allBolides.filter(bolide => {
        const valor = bolide?.Inicio_de_la_trayectoria_Estacion_1; // Usar optional chaining

        if (valor && valor !== 'No medido') { // Comprobación más concisa
          let partes = valor.split(' ');
          return parseFloat(partes[2]) >= parseFloat(heightFilter);
        } else {

          return false; // Excluir el bolide del array filtrado
        }
      });
    }
    if (dateRangeChecked === 'true') {
      allBolides = allBolides.filter(bolide => {
        const fechaBolide = new Date(bolide.Fecha); // Asegúrate de que 'Fecha' es el campo correcto
        const fechaInicio = new Date(startDate);
        const fechaFin = new Date(endDate);

        return fechaBolide >= fechaInicio && fechaBolide <= fechaFin;

      })
    }




    res.json({ data: allBolides, totalItems });

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



const ExcelJS = require('exceljs');

const getBolideWithCustomSearchCSV = async (req, res) => {
  try {
    const { heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage, reportType } = req.query;
    const offs = actualPage * 50;
    /*    REPORT_TYPE
        1: "Todos los bólidos sin filtros"
        2: "Bólidos con Informe_Z"
        3: "Bólidos con Informe Radiante"
        4: "Bólidos con Informe Fotometría"
        5: "Bólidos con todos los informes"
    */

    let totalItems = 0;
    let allBolides = []; // Usar let en lugar de const
    let totalItemsResult = [];
    let params = [];
    let query = ``;
    switch (reportType) {
      case '1':
        // Obtener todos los bólidos sin filtros
        query = `
        SELECT m.*, 
          CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ,
          CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant,
          1 AS hasReportPhotometry,
          GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
          GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante,
          GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
        FROM Meteoro m 
        LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
        LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador
        INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador`;
        // Agregar filtro por rango de fechas si está activado
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        // Agregar LIMIT y OFFSET
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);


        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');



        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '2':
        // Obtener todos los bólidos con Informe_Z
        query = `
  SELECT 
    m.*, 
    1 AS hasReportZ, 
    CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, 
    CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry,
    GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
    GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
    GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria,
    iz.Inicio_de_la_trayectoria_Estacion_1,
    CAST(
      SUBSTRING_INDEX(
        SUBSTRING_INDEX(iz.Inicio_de_la_trayectoria_Estacion_1, ' ', 4), 
        ' ', -1
      ) AS DECIMAL(10,6)
    ) AS altura
  FROM 
    Meteoro m 
    INNER JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
    LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
    LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador 
`;

        // Condiciones WHERE dinámicas
        let conditions = [];

        // Filtro por rango de fechas
        if (dateRangeChecked === 'true' && startDate && endDate) {
          conditions.push(`iz.Fecha >= ? AND iz.Fecha <= ?`);
          params.push(startDate, endDate);
        }

        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')} `;
        }

        // Agrupamiento
        query += ` GROUP BY m.Identificador `;

        // Filtro por altura en HAVING
        if (heightChecked === 'true' && heightFilter) {
          query += ` HAVING altura < ? `;
          params.push(heightFilter);
        }

        // Limit y offset
        query += ` LIMIT 50 OFFSET ? `;
        params.push(offs);



        // Ejecutar la consulta
        [allBolides] = await pool.query(query, params);



        if ((latLonChecked === 'true' && latFilter && lonFilter && ratioFilter) ||
          (heightChecked === 'true' && heightFilter)) {

          allBolides = allBolides.filter(bolide => {
            const [latDMS, lonDMS, distance, altitude] = bolide.Inicio_de_la_trayectoria_Estacion_1.split(" ");
            const lonF = individuaConvertSexagesimalToDecimal(latDMS);
            const latF = individuaConvertSexagesimalToDecimal(lonDMS);

            const isInRadius = latLonChecked === 'true' && latFilter && lonFilter && ratioFilter
              ? isPointInRadius(latFilter, lonFilter, ratioFilter * 1000, latF, lonF)
              : true;


            return isInRadius;
          });
        }





        [totalItemsResult] = await pool.query(`SELECT 
                                                COUNT(DISTINCT m.Identificador) AS total_meteoros
                                                FROM Meteoro m 
                                                INNER JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
                                                LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
                                                LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador;
                                                `);
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '3':
        // Obtener todos los bólidos con Informe Radiante
        query = `SELECT m.*, 
          CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, 1 AS hasReportRadiant, 
          CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry, 
          GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, 
          GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
          GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
          ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} 
          FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
          INNER JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
          LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador `;
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);
        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Radiante i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '4':
        // Obtener todos los bólidos con Informe Fotometría
        query = `SELECT m.*, 
        CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, 
        CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, 1 AS hasReportPhotometry,
         GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, 
         GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
         ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} 
         FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador 
         LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador 
         INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador `;
        if (dateRangeChecked === 'true' && startDate && endDate) {
          query += ` WHERE iz.Fecha >= ? AND iz.Fecha <= ? `;
          params.push(startDate, endDate);
        }
        query += ` GROUP BY m.Identificador  LIMIT 50 OFFSET ?`;
        params.push(offs);
        [allBolides] = await pool.query(query, params);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;

      default:
        // Obtener todos los bólidos sin filtros
        [allBolides] = await pool.query(`SELECT * FROM Meteoro LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro ');
        otalItems = totalItemsResult[0]['count(*)'];
        break;
    }







    // ... (el resto del código de consulta se mantiene igual hasta la obtención de allBolides)

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Datos de Meteoro
    const meteoroSheet = workbook.addWorksheet('Meteoros');
    meteoroSheet.addRow(['Identificador', 'Fecha', 'Hora']);

    allBolides.forEach(meteor => {
      meteoroSheet.addRow([
        meteor.Identificador,
        meteor.Fecha,
        meteor.Hora
      ]);
    });

    // Hoja 2: Informe_Z
    const informeZSheet = workbook.addWorksheet('Informe_Z');
    informeZSheet.addRow([
      'IdInforme', 'Observatorio_Número2', 'Observatorio_Número', 'Fecha', 'Hora',
      'Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1',
      'Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2', 'Fotogramas_usados',
      'Ajuste_estación_2_Inicio', 'Ajuste_estación_2_Final', 'Ángulo_diedro_entre_planos_trayectoria',
      'Peso_estadístico', 'Errores_AR_DE_radiante',
      'Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha',
      'Coordenadas_astronómicas_del_radiante_J200', 'Azimut', 'Dist_Cenital',
      'Inicio_de_la_trayectoria_Estacion_1', 'Fin_de_la_trayectoria_Estacion_1',
      'Inicio_de_la_trayectoria_Estacion_2', 'Fin_de_la_trayectoria_Estacion_2',
      'Impacto_previsible', 'Distancia_recorrida_Estacion_1', 'Error_distancia_Estacion_1',
      'Error_alturas_Estacion_1', 'Distancia_recorrida_Estacion_2', 'Error_distancia_Estacion_2',
      'Error_alturas_Estacion_2', 'Tiempo_Estacion_1', 'Velocidad_media', 'Tiempo_trayectoria_en_estacion_2',
      'Ecuacion_del_movimiento_en_Kms', 'Ecuacion_del_movimiento_en_gs', 'Error_Velocidad',
      'Velocidad_Inicial_Estacion_2', 'Aceleración_en_Kms', 'Aceleración_en_gs', 'Método_utilizado',
      'Ecuacion_parametrica_IdEc', 'Meteoro_Identificador'


    ]);

    const meteorIds = allBolides.map(b => b.Identificador);
    const informeZIDs = allBolides.map(b => b.IDs_Informe_Z !== null ? b.IDs_Informe_Z.split("/") : null).flat().filter(Boolean); let informeZData = [];
    if (informeZIDs.length > 0) {
      const placeholders = informeZIDs.map(() => '?').join(', ');
      const query = `SELECT * FROM Informe_Z iz WHERE iz.IdInforme IN (${placeholders})`;

      [informeZData] = await pool.query(query, [...informeZIDs]);
    }


    informeZData.forEach(row => {
      informeZSheet.addRow([
        row.IdInforme,
        row.Observatorio_Número2,
        row.Observatorio_Número,
        row.Fecha,
        row.Hora,
        row.Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1,
        row.Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2,
        row.Fotogramas_usados,
        row.Ajuste_estación_2_Inicio,
        row.Ajuste_estación_2_Final,
        row.Ángulo_diedro_entre_planos_trayectoria,
        row.Peso_estadístico,
        row.Errores_AR_DE_radiante,
        row.Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha,
        row.Coordenadas_astronómicas_del_radiante_J200,
        row.Azimut,
        row.Dist_Cenital,
        row.Inicio_de_la_trayectoria_Estacion_1,
        row.Fin_de_la_trayectoria_Estacion_1,
        row.Inicio_de_la_trayectoria_Estacion_2,
        row.Fin_de_la_trayectoria_Estacion_2,
        row.Impacto_previsible,
        row.Distancia_recorrida_Estacion_1,
        row.Error_distancia_Estacion_1,
        row.Error_alturas_Estacion_1,
        row.Distancia_recorrida_Estacion_2,
        row.Error_distancia_Estacion_2,
        row.Error_alturas_Estacion_2,
        row.Tiempo_Estacion_1,
        row.Velocidad_media,
        row.Tiempo_trayectoria_en_estacion_2,
        row.Ecuacion_del_movimiento_en_Kms,
        row.Ecuacion_del_movimiento_en_gs,
        row.Error_Velocidad,
        row.Velocidad_Inicial_Estacion_2,
        row.Aceleración_en_Kms,
        row.Aceleración_en_gs,
        row.Método_utilizado,
        row.Ecuacion_parametrica_IdEc,
        row.Meteoro_Identificador
      ]);
    });

    // Hoja 3: Informe_Radiante (si existe)
    const informeRadianteSheet = workbook.addWorksheet('Informe_Radiante');
    informeRadianteSheet.addRow(['Identificador', 'Fecha', 'Hora', 'Velocidad_Lluvia_Asociada', 'Trayectorias_estimadas_para', 'Distancia_angular_radianes', 'Distancia_angular_grados', 'Velocidad_angular_grad_sec', 'Meteoro_Identificador', 'Observatorio_Número', 'Lluvia_Asociada']);

    const informeRadianteIDs = allBolides.map(b => b.IDs_Informe_Radiante !== null ? b.IDs_Informe_Radiante.split("/") : null).flat().filter(Boolean);
    let informeRadianteData = [];
    if (informeRadianteIDs.length > 0) {
      const placeholders = informeRadianteIDs.map(() => '?').join(', ');
      const query = `SELECT * FROM Informe_Radiante ir WHERE ir.Identificador IN (${placeholders})`;

      [informeRadianteData] = await pool.query(query, [...informeRadianteIDs]);
    }

    informeRadianteData.forEach(row => {
      informeRadianteSheet.addRow([
        row.Identificador,
        row.Fecha,
        row.Hora,
        row.Velocidad_Lluvia_Asociada,
        row.Trayectorias_estimadas_para,
        row.Distancia_angular_radianes,
        row.Distancia_angular_grados,
        row.Velocidad_angular_grad_sec,
        row.Meteoro_Identificador,
        row.Observatorio_Número,
        row.Lluvia_Asociada
      ]);
    });

    // Hoja 4: Informe_Fotometria (si existe)
    const informeFotometriaSheet = workbook.addWorksheet('Informe_Fotometria');
    informeFotometriaSheet.addRow(['Identificador', 'Fecha', 'Hora', 'Estrellas_visibles', 'Estrellas_usadas_para_regresion', 'Coeficiente_externo_Recta_de_Bouger', 'Punto_cero_Recta_de_Bouger', 'Error_tipico_regresion', 'Error_tipico_punto_cero', 'Error_tipico_coeficiente_externo', 'Coeficientes_parabola_trayectoria', 'MagMax', 'MagMin', 'Masa_fotometrica', 'Meteoro_Identificador']);

    const informeFotometriaIDs = allBolides.map(b => b.IDs_Informe_Fotometria !== null ? b.IDs_Informe_Fotometria.split("/") : null).flat().filter(Boolean);
    let informeFotometriaData = [];
    if (informeFotometriaIDs.length > 0) {
      const placeholders = informeFotometriaIDs.map(() => '?').join(', ');
      const query = `SELECT * FROM Informe_Fotometria if2 WHERE if2.Identificador IN (${placeholders})`;

      [informeFotometriaData] = await pool.query(query, [...informeFotometriaIDs]);
    }


    informeFotometriaData.forEach(row => {
      informeFotometriaSheet.addRow([
        row.Identificador,
        row.Fecha,
        row.Hora,
        row.Estrellas_visibles,
        row.Estrellas_usadas_para_regresion,
        row.Coeficiente_externo_Recta_de_Bouger,
        row.Punto_cero_Recta_de_Bouger,
        row.Error_tipico_regresion,
        row.Error_tipico_punto_cero,
        row.Error_tipico_coeficiente_externo,
        row.Coeficientes_parabola_trayectoria,
        row.MagMax,
        row.MagMin,
        row.Masa_fotometrica,
        row.Meteoro_Identificador
      ]);
    });

    // Configurar los headers de la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=meteor_reports.xlsx');

    // Escribir el libro de Excel en la respuesta
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};













const getReportData = async (req, res) => {
  try {
    const { IDs_Informe_Z, IDs_Informe_Radiante, IDs_Informe_Fotometria } = req.query;

    const [reportData] = await pool.query('SELECT * FROM Informe_Z WHERE IdInforme IN (?)', [IDs_Informe_Z]);
    const [reportDataRadiant] = await pool.query('SELECT * FROM Informe_Radiante WHERE Identificador IN (?)', [IDs_Informe_Radiante]);
    const [reportDataPhotometry] = await pool.query('SELECT * FROM Informe_Fotometria WHERE Identificador IN (?)', [IDs_Informe_Fotometria]);
    res.json({ reportData, reportDataRadiant, reportDataPhotometry });

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ------------------------------------------- AUX FUNCTIONS ------------------------------------------- //

// Función para filtrar datos de los últimos 6 meses
const filterRecentData = (data) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // Obtenemos la fecha de hace 6 meses

  return data.filter(item => new Date(item.date) >= sixMonthsAgo);
};



// Función para calcular la distancia entre dos puntos (en kilómetros)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const radioTierra = 6371; // Radio de la Tierra en kilómetros
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = radioTierra * c; // Distancia en kilómetros
  return distancia;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}





module.exports = {
  getAllBolide,
  getAllBolideLastSixMonths,
  getBolideById,
  getBolideCompareLastTen,
  getBolideCompareLastTwo,
  getBolideWithCustomSearch,
  testing,
  getReportData,
  getBolideWithCustomSearchCSV
};
