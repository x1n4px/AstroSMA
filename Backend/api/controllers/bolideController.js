const pool = require('../database/connection');




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

    switch (reportType) {
      case '1':
        // Obtener todos los bólidos sin filtros
        let query = `
        SELECT m.*, 
          CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ,
          CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant,
          1 AS hasReportPhotometry,
          GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
          GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante,
          GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria 
          ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''}
          
        FROM Meteoro m 
        LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
        LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador
        INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador
        GROUP BY m.Identificador
        LIMIT 50 OFFSET ?`;



        [allBolides] = await pool.query(query, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '2':
        // Obtener todos los bólidos con Informe_Z
        [allBolides] = await pool.query(`SELECT m.*, 1 AS hasReportZ, CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry, GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} FROM Meteoro m INNER JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador GROUP BY m.Identificador LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '3':
        // Obtener todos los bólidos con Informe Radiante
        [allBolides] = await pool.query(`SELECT m.*, CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, 1 AS hasReportRadiant, CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry, GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador INNER JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador GROUP BY m.Identificador LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Radiante i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '4':
        // Obtener todos los bólidos con Informe Fotometría
        [allBolides] = await pool.query(`SELECT m.*, CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, 1 AS hasReportPhotometry, GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador INNER JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador GROUP BY m.Identificador LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m JOIN Informe_Fotometria i ON m.Identificador = i.Identificador');
        totalItems = totalItemsResult[0]['count(*)'];
        break;
      case '5':
        // Obtener todos los bólidos con todos los informes
        [allBolides] = await pool.query(`SELECT m.*, CASE WHEN MAX(iz.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportZ, CASE WHEN MAX(ir.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportRadiant, CASE WHEN MAX(if2.Meteoro_Identificador) IS NOT NULL THEN 1 ELSE 0 END AS hasReportPhotometry, GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z, GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante, GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria ${heightChecked ? ', iz.Inicio_de_la_trayectoria_Estacion_1' : ''} FROM Meteoro m LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador GROUP BY m.Identificador LIMIT 50 OFFSET ?`, [offs]);
        [totalItemsResult] = await pool.query('SELECT count(*) FROM Meteoro m ');
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
  getReportData
};
