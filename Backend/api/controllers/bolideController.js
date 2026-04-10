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

const parseBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1' || value === 'on';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).trim().replace(',', '.');
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseText = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const buildCustomSearchBaseQuery = ({ whereClauses, havingClauses }) => `
  SELECT
    m.*,
    MAX(CASE WHEN iz.IdInforme IS NOT NULL THEN 1 ELSE 0 END) AS hasReportZ,
    MAX(CASE WHEN ir.Identificador IS NOT NULL THEN 1 ELSE 0 END) AS hasReportRadiant,
    MAX(CASE WHEN if2.Identificador IS NOT NULL THEN 1 ELSE 0 END) AS hasReportPhotometry,
    GROUP_CONCAT(DISTINCT iz.IdInforme SEPARATOR "/") AS IDs_Informe_Z,
    GROUP_CONCAT(DISTINCT ir.Identificador SEPARATOR "/") AS IDs_Informe_Radiante,
    GROUP_CONCAT(DISTINCT if2.Identificador SEPARATOR "/") AS IDs_Informe_Fotometria,
    MAX(iz.Inicio_de_la_trayectoria_Estacion_1) AS Inicio_de_la_trayectoria_Estacion_1,
    MAX(iz.Velocidad_media) AS velocidadMedia,
    MAX(ir.Velocidad_angular_grad_sec) AS velocidadAngular,
    MAX(if2.MagMax) AS magMax,
    MAX(if2.Masa_fotometrica) AS masaFotometrica,
    MAX(if2.Estrellas_visibles) AS estrellasVisibles,
    GROUP_CONCAT(DISTINCT ir.Lluvia_Asociada SEPARATOR "/") AS lluviasAsociadas,
    GROUP_CONCAT(DISTINCT iz.\`Observatorio_Número\` SEPARATOR "/") AS observatoriosZ1,
    GROUP_CONCAT(DISTINCT iz.\`Observatorio_Número2\` SEPARATOR "/") AS observatoriosZ2,
    GROUP_CONCAT(DISTINCT ir.\`Observatorio_Número\` SEPARATOR "/") AS observatoriosRadiant,
    CAST(
      SUBSTRING_INDEX(
        SUBSTRING_INDEX(MAX(iz.Inicio_de_la_trayectoria_Estacion_1), ' ', 4),
        ' ',
        -1
      ) AS DECIMAL(10,3)
    ) AS altitudeFromZ
  FROM Meteoro m
  LEFT JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador
  LEFT JOIN Informe_Radiante ir ON ir.Meteoro_Identificador = m.Identificador
  LEFT JOIN Informe_Fotometria if2 ON if2.Meteoro_Identificador = m.Identificador
  WHERE ${whereClauses.join(' AND ')}
  GROUP BY m.Identificador
  HAVING ${havingClauses.join(' AND ')}
`;

const getBolideWithCustomSearch = async (req, res) => {
  try {
    const {
      heightFilter,
      latFilter,
      lonFilter,
      ratioFilter,
      heightChecked,
      latLonChecked,
      dateRangeChecked,
      startDate,
      endDate,
      actualPage,
      reportType,
      meteorIdFilter,
      observatoryFilter,
      showerFilter: rawShowerFilter,
      minVelocityFilter,
      maxVelocityFilter,
      minAngularVelocityFilter,
      maxAngularVelocityFilter,
      requireReportZ,
      requireReportRadiant,
      requireReportPhotometry,
      sortOrder,
      timeFrom: rawTimeFrom,
      timeTo: rawTimeTo,
      minMagMaxFilter,
      maxMagMaxFilter,
      minMassFilter,
      maxMassFilter
    } = req.query;

    const page = Number(actualPage) || 0;
    const itemsPerPage = 50;
    const offs = page * itemsPerPage;
    const radiusMeters = parseNumber(ratioFilter) ? parseNumber(ratioFilter) * 1000 : null;
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const showerFilter = parseText(rawShowerFilter);
    const timeFrom = parseText(rawTimeFrom);
    const timeTo = parseText(rawTimeTo);

    const whereClauses = ['1=1'];
    const whereParams = [];

    if (parseBoolean(dateRangeChecked) && startDate && endDate) {
      whereClauses.push('m.Fecha >= ? AND m.Fecha <= ?');
      whereParams.push(startDate, endDate);
    }
    if (timeFrom) {
      whereClauses.push('LEFT(m.Hora, 8) >= ?');
      whereParams.push(timeFrom.length === 5 ? `${timeFrom}:00` : timeFrom);
    }
    if (timeTo) {
      whereClauses.push('LEFT(m.Hora, 8) <= ?');
      whereParams.push(timeTo.length === 5 ? `${timeTo}:00` : timeTo);
    }

    const meteorId = parseNumber(meteorIdFilter);
    if (meteorId !== null) {
      whereClauses.push('m.Identificador = ?');
      whereParams.push(meteorId);
    }

    const observatoryId = parseNumber(observatoryFilter);
    if (observatoryId !== null) {
      whereClauses.push(`(
        EXISTS (
          SELECT 1
          FROM Informe_Z iz_obs
          WHERE iz_obs.Meteoro_Identificador = m.Identificador
            AND (iz_obs.\`Observatorio_Número\` = ? OR iz_obs.\`Observatorio_Número2\` = ?)
        )
        OR EXISTS (
          SELECT 1
          FROM Informe_Radiante ir_obs
          WHERE ir_obs.Meteoro_Identificador = m.Identificador
            AND ir_obs.\`Observatorio_Número\` = ?
        )
      )`);
      whereParams.push(observatoryId, observatoryId, observatoryId);
    }

    if (showerFilter) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM Informe_Radiante ir_sh
        WHERE ir_sh.Meteoro_Identificador = m.Identificador
          AND ir_sh.Lluvia_Asociada LIKE ?
      )`);
      whereParams.push(`%${showerFilter}%`);
    }

    const havingClauses = ['1=1'];
    const havingParams = [];

    switch (reportType) {
      case '2':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '3':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '4':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '5':
        whereClauses.push(
          'EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)'
        );
        break;
      default:
        break;
    }

    if (parseBoolean(requireReportZ)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)');
    }
    if (parseBoolean(requireReportRadiant)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
    }
    if (parseBoolean(requireReportPhotometry)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
    }

    const heightValue = parseNumber(heightFilter);
    if (parseBoolean(heightChecked) && heightValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM Informe_Z iz_h
        WHERE iz_h.Meteoro_Identificador = m.Identificador
          AND CAST(
            SUBSTRING_INDEX(
              SUBSTRING_INDEX(iz_h.Inicio_de_la_trayectoria_Estacion_1, ' ', 4),
              ' ',
              -1
            ) AS DECIMAL(10,3)
          ) >= ?
      )`);
      whereParams.push(heightValue);
    }

    let minVelocityValue = parseNumber(minVelocityFilter);
    let maxVelocityValue = parseNumber(maxVelocityFilter);
    if (minVelocityValue !== null && maxVelocityValue !== null && minVelocityValue > maxVelocityValue) {
      const temp = minVelocityValue;
      minVelocityValue = maxVelocityValue;
      maxVelocityValue = temp;
    }
    if (minVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND iz_v.Velocidad_media >= ?
      )`);
      whereParams.push(minVelocityValue);
    }
    if (maxVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND iz_v.Velocidad_media <= ?
      )`);
      whereParams.push(maxVelocityValue);
    }
    let minAngularVelocityValue = parseNumber(minAngularVelocityFilter);
    let maxAngularVelocityValue = parseNumber(maxAngularVelocityFilter);
    if (minAngularVelocityValue !== null && maxAngularVelocityValue !== null && minAngularVelocityValue > maxAngularVelocityValue) {
      const temp = minAngularVelocityValue;
      minAngularVelocityValue = maxAngularVelocityValue;
      maxAngularVelocityValue = temp;
    }
    if (minAngularVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Radiante ir_v
        WHERE ir_v.Meteoro_Identificador = m.Identificador
          AND ir_v.Velocidad_angular_grad_sec >= ?
      )`);
      whereParams.push(minAngularVelocityValue);
    }
    if (maxAngularVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Radiante ir_v
        WHERE ir_v.Meteoro_Identificador = m.Identificador
          AND ir_v.Velocidad_angular_grad_sec <= ?
      )`);
      whereParams.push(maxAngularVelocityValue);
    }
    let minMagMaxValue = parseNumber(minMagMaxFilter);
    let maxMagMaxValue = parseNumber(maxMagMaxFilter);
    if (minMagMaxValue !== null && maxMagMaxValue !== null && minMagMaxValue > maxMagMaxValue) {
      const temp = minMagMaxValue;
      minMagMaxValue = maxMagMaxValue;
      maxMagMaxValue = temp;
    }
    if (minMagMaxValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_m
        WHERE if_m.Meteoro_Identificador = m.Identificador
          AND if_m.MagMax >= ?
      )`);
      whereParams.push(minMagMaxValue);
    }
    if (maxMagMaxValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_m
        WHERE if_m.Meteoro_Identificador = m.Identificador
          AND if_m.MagMax <= ?
      )`);
      whereParams.push(maxMagMaxValue);
    }
    let minMassValue = parseNumber(minMassFilter);
    let maxMassValue = parseNumber(maxMassFilter);
    if (minMassValue !== null && maxMassValue !== null && minMassValue > maxMassValue) {
      const temp = minMassValue;
      minMassValue = maxMassValue;
      maxMassValue = temp;
    }
    if (minMassValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_mass
        WHERE if_mass.Meteoro_Identificador = m.Identificador
          AND if_mass.Masa_fotometrica >= ?
      )`);
      whereParams.push(minMassValue);
    }
    if (maxMassValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_mass
        WHERE if_mass.Meteoro_Identificador = m.Identificador
          AND if_mass.Masa_fotometrica <= ?
      )`);
      whereParams.push(maxMassValue);
    }

    const baseQuery = buildCustomSearchBaseQuery({ whereClauses, havingClauses });
    const baseParams = [...whereParams, ...havingParams];

    const applyRadiusFilter = (rows) => {
      if (!parseBoolean(latLonChecked) || !latFilter || !lonFilter || !radiusMeters) {
        return rows;
      }

      return rows.filter((bolide) => {
        const initialTrajectory = bolide?.Inicio_de_la_trayectoria_Estacion_1;
        if (!initialTrajectory || initialTrajectory === 'No medido') {
          return false;
        }

        const [latDMS, lonDMS] = initialTrajectory.split(' ');
        if (!latDMS || !lonDMS) return false;

        const lonF = individuaConvertSexagesimalToDecimal(latDMS);
        const latF = individuaConvertSexagesimalToDecimal(lonDMS);

        return isPointInRadius(Number(latFilter), Number(lonFilter), radiusMeters, latF, lonF);
      });
    };

    let allBolides = [];
    let totalItems = 0;

    if (parseBoolean(latLonChecked) && latFilter && lonFilter && radiusMeters) {
      const fullDataQuery = `${baseQuery} ORDER BY m.Fecha ${sortDirection}, m.Hora ${sortDirection}, m.Identificador ${sortDirection}`;
      const [allRows] = await pool.query(fullDataQuery, baseParams);
      const filteredRows = applyRadiusFilter(allRows);
      totalItems = filteredRows.length;
      allBolides = filteredRows.slice(offs, offs + itemsPerPage);
    } else {
      const countQuery = `SELECT COUNT(*) AS totalItems FROM (${baseQuery}) AS filtered_results`;
      const [countRows] = await pool.query(countQuery, baseParams);
      totalItems = countRows[0]?.totalItems || 0;

      const dataQuery = `${baseQuery} ORDER BY m.Fecha ${sortDirection}, m.Hora ${sortDirection}, m.Identificador ${sortDirection} LIMIT ? OFFSET ?`;
      const [rows] = await pool.query(dataQuery, [...baseParams, itemsPerPage, offs]);
      allBolides = rows;
    }

    res.json({
      data: allBolides,
      totalItems,
      appliedFilters: {
        reportType,
        meteorId,
        observatoryId,
        showerFilter: showerFilter || null,
        dateRangeChecked: parseBoolean(dateRangeChecked),
        startDate: startDate || null,
        endDate: endDate || null,
        timeFrom: timeFrom || null,
        timeTo: timeTo || null,
        heightChecked: parseBoolean(heightChecked),
        heightValue,
        latLonChecked: parseBoolean(latLonChecked),
        latFilter: parseNumber(latFilter),
        lonFilter: parseNumber(lonFilter),
        ratioKm: parseNumber(ratioFilter),
        minVelocityValue,
        maxVelocityValue,
        minAngularVelocityValue,
        maxAngularVelocityValue,
        minMagMaxValue,
        maxMagMaxValue,
        minMassValue,
        maxMassValue,
        requireReportZ: parseBoolean(requireReportZ),
        requireReportRadiant: parseBoolean(requireReportRadiant),
        requireReportPhotometry: parseBoolean(requireReportPhotometry),
        sortDirection
      }
    });

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



const getBolideWithCustomSearchCSV = async (req, res) => {
  try {
    const {
      heightFilter,
      latFilter,
      lonFilter,
      ratioFilter,
      heightChecked,
      latLonChecked,
      dateRangeChecked,
      startDate,
      endDate,
      reportType,
      meteorIdFilter,
      observatoryFilter,
      showerFilter: rawShowerFilter,
      minVelocityFilter,
      maxVelocityFilter,
      minAngularVelocityFilter,
      maxAngularVelocityFilter,
      requireReportZ,
      requireReportRadiant,
      requireReportPhotometry,
      sortOrder,
      timeFrom: rawTimeFrom,
      timeTo: rawTimeTo,
      minMagMaxFilter,
      maxMagMaxFilter,
      minMassFilter,
      maxMassFilter
    } = req.query;

    const radiusMeters = parseNumber(ratioFilter) ? parseNumber(ratioFilter) * 1000 : null;
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const showerFilter = parseText(rawShowerFilter);
    const timeFrom = parseText(rawTimeFrom);
    const timeTo = parseText(rawTimeTo);

    const whereClauses = ['1=1'];
    const whereParams = [];

    if (parseBoolean(dateRangeChecked) && startDate && endDate) {
      whereClauses.push('m.Fecha >= ? AND m.Fecha <= ?');
      whereParams.push(startDate, endDate);
    }
    if (timeFrom) {
      whereClauses.push('LEFT(m.Hora, 8) >= ?');
      whereParams.push(timeFrom.length === 5 ? `${timeFrom}:00` : timeFrom);
    }
    if (timeTo) {
      whereClauses.push('LEFT(m.Hora, 8) <= ?');
      whereParams.push(timeTo.length === 5 ? `${timeTo}:00` : timeTo);
    }

    const meteorId = parseNumber(meteorIdFilter);
    if (meteorId !== null) {
      whereClauses.push('m.Identificador = ?');
      whereParams.push(meteorId);
    }

    const observatoryId = parseNumber(observatoryFilter);
    if (observatoryId !== null) {
      whereClauses.push(`(
        EXISTS (
          SELECT 1
          FROM Informe_Z iz_obs
          WHERE iz_obs.Meteoro_Identificador = m.Identificador
            AND (iz_obs.\`Observatorio_Número\` = ? OR iz_obs.\`Observatorio_Número2\` = ?)
        )
        OR EXISTS (
          SELECT 1
          FROM Informe_Radiante ir_obs
          WHERE ir_obs.Meteoro_Identificador = m.Identificador
            AND ir_obs.\`Observatorio_Número\` = ?
        )
      )`);
      whereParams.push(observatoryId, observatoryId, observatoryId);
    }

    if (showerFilter) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM Informe_Radiante ir_sh
        WHERE ir_sh.Meteoro_Identificador = m.Identificador
          AND ir_sh.Lluvia_Asociada LIKE ?
      )`);
      whereParams.push(`%${showerFilter}%`);
    }

    const havingClauses = ['1=1'];
    const havingParams = [];

    switch (reportType) {
      case '2':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '3':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '4':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '5':
        whereClauses.push(
          'EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)'
        );
        break;
      default:
        break;
    }

    if (parseBoolean(requireReportZ)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador)');
    }
    if (parseBoolean(requireReportRadiant)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
    }
    if (parseBoolean(requireReportPhotometry)) {
      whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
    }

    const heightValue = parseNumber(heightFilter);
    if (parseBoolean(heightChecked) && heightValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM Informe_Z iz_h
        WHERE iz_h.Meteoro_Identificador = m.Identificador
          AND CAST(
            SUBSTRING_INDEX(
              SUBSTRING_INDEX(iz_h.Inicio_de_la_trayectoria_Estacion_1, ' ', 4),
              ' ',
              -1
            ) AS DECIMAL(10,3)
          ) >= ?
      )`);
      whereParams.push(heightValue);
    }

    let minVelocityValue = parseNumber(minVelocityFilter);
    let maxVelocityValue = parseNumber(maxVelocityFilter);
    if (minVelocityValue !== null && maxVelocityValue !== null && minVelocityValue > maxVelocityValue) {
      const temp = minVelocityValue;
      minVelocityValue = maxVelocityValue;
      maxVelocityValue = temp;
    }
    if (minVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND iz_v.Velocidad_media >= ?
      )`);
      whereParams.push(minVelocityValue);
    }
    if (maxVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND iz_v.Velocidad_media <= ?
      )`);
      whereParams.push(maxVelocityValue);
    }

    let minAngularVelocityValue = parseNumber(minAngularVelocityFilter);
    let maxAngularVelocityValue = parseNumber(maxAngularVelocityFilter);
    if (minAngularVelocityValue !== null && maxAngularVelocityValue !== null && minAngularVelocityValue > maxAngularVelocityValue) {
      const temp = minAngularVelocityValue;
      minAngularVelocityValue = maxAngularVelocityValue;
      maxAngularVelocityValue = temp;
    }
    if (minAngularVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Radiante ir_v
        WHERE ir_v.Meteoro_Identificador = m.Identificador
          AND ir_v.Velocidad_angular_grad_sec >= ?
      )`);
      whereParams.push(minAngularVelocityValue);
    }
    if (maxAngularVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Radiante ir_v
        WHERE ir_v.Meteoro_Identificador = m.Identificador
          AND ir_v.Velocidad_angular_grad_sec <= ?
      )`);
      whereParams.push(maxAngularVelocityValue);
    }

    let minMagMaxValue = parseNumber(minMagMaxFilter);
    let maxMagMaxValue = parseNumber(maxMagMaxFilter);
    if (minMagMaxValue !== null && maxMagMaxValue !== null && minMagMaxValue > maxMagMaxValue) {
      const temp = minMagMaxValue;
      minMagMaxValue = maxMagMaxValue;
      maxMagMaxValue = temp;
    }
    if (minMagMaxValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_m
        WHERE if_m.Meteoro_Identificador = m.Identificador
          AND if_m.MagMax >= ?
      )`);
      whereParams.push(minMagMaxValue);
    }
    if (maxMagMaxValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_m
        WHERE if_m.Meteoro_Identificador = m.Identificador
          AND if_m.MagMax <= ?
      )`);
      whereParams.push(maxMagMaxValue);
    }

    let minMassValue = parseNumber(minMassFilter);
    let maxMassValue = parseNumber(maxMassFilter);
    if (minMassValue !== null && maxMassValue !== null && minMassValue > maxMassValue) {
      const temp = minMassValue;
      minMassValue = maxMassValue;
      maxMassValue = temp;
    }
    if (minMassValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_mass
        WHERE if_mass.Meteoro_Identificador = m.Identificador
          AND if_mass.Masa_fotometrica >= ?
      )`);
      whereParams.push(minMassValue);
    }
    if (maxMassValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Fotometria if_mass
        WHERE if_mass.Meteoro_Identificador = m.Identificador
          AND if_mass.Masa_fotometrica <= ?
      )`);
      whereParams.push(maxMassValue);
    }

    const baseQuery = buildCustomSearchBaseQuery({ whereClauses, havingClauses });
    const baseParams = [...whereParams, ...havingParams];
    const fullDataQuery = `${baseQuery} ORDER BY m.Fecha ${sortDirection}, m.Hora ${sortDirection}, m.Identificador ${sortDirection}`;
    const [allRows] = await pool.query(fullDataQuery, baseParams);

    const applyRadiusFilter = (rows) => {
      if (!parseBoolean(latLonChecked) || !latFilter || !lonFilter || !radiusMeters) {
        return rows;
      }

      return rows.filter((bolide) => {
        const initialTrajectory = bolide?.Inicio_de_la_trayectoria_Estacion_1;
        if (!initialTrajectory || initialTrajectory === 'No medido') {
          return false;
        }

        const [latDMS, lonDMS] = initialTrajectory.split(' ');
        if (!latDMS || !lonDMS) return false;

        const lonF = individuaConvertSexagesimalToDecimal(latDMS);
        const latF = individuaConvertSexagesimalToDecimal(lonDMS);

        return isPointInRadius(Number(latFilter), Number(lonFilter), radiusMeters, latF, lonF);
      });
    };

    const allBolides = applyRadiusFilter(allRows);

    const formatDate = (value) => {
      if (value === null || value === undefined || value === '') return '';
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
      }
      return String(value).slice(0, 10);
    };

    const formatTime = (value) => {
      if (value === null || value === undefined || value === '') return '';
      const parsed = String(value).trim().match(/^(\d{2}:\d{2}:\d{2})/);
      return parsed ? parsed[1] : String(value).trim();
    };

    const normalizeValue = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      return String(value).trim();
    };

    const mergeObservatories = (row) => {
      const unique = new Set();
      [row.observatoriosZ1, row.observatoriosZ2]
        .filter(Boolean)
        .flatMap((value) => String(value).split('/').map((item) => item.trim()).filter(Boolean))
        .forEach((value) => unique.add(value));
      return Array.from(unique).join('/');
    };

    const csvEscape = (value) => {
      const normalized = normalizeValue(value);
      if (/[",\r\n]/.test(normalized)) {
        return `"${normalized.replace(/"/g, '""')}"`;
      }
      return normalized;
    };

    const header = [
      'meteor_id',
      'date',
      'time_utc',
      'has_report_z',
      'has_report_radiant',
      'has_report_photometry',
      'report_ids_z',
      'report_ids_radiant',
      'report_ids_photometry',
      'associated_showers',
      'observatories_z',
      'observatories_radiant',
      'avg_velocity_km_s',
      'angular_velocity_deg_s',
      'mag_max',
      'photometric_mass',
      'start_altitude_km',
      'start_trajectory_station_1'
    ];

    const lines = [header.map(csvEscape).join(',')];
    allBolides.forEach((row) => {
      lines.push(
        [
          row.Identificador,
          formatDate(row.Fecha),
          formatTime(row.Hora),
          row.hasReportZ ? 1 : 0,
          row.hasReportRadiant ? 1 : 0,
          row.hasReportPhotometry ? 1 : 0,
          row.IDs_Informe_Z,
          row.IDs_Informe_Radiante,
          row.IDs_Informe_Fotometria,
          row.lluviasAsociadas,
          mergeObservatories(row),
          row.observatoriosRadiant,
          row.velocidadMedia,
          row.velocidadAngular,
          row.magMax,
          row.masaFotometrica,
          row.altitudeFromZ,
          row.Inicio_de_la_trayectoria_Estacion_1
        ].map(csvEscape).join(',')
      );
    });

    const csvContent = `\uFEFFsep=,\r\n${lines.join('\r\n')}\r\n`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="meteor_reports.csv"');
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};










const splitIds = (str) => {
  if (!str || typeof str !== 'string') return [];
  return str
    .split('/')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => Number.isInteger(id));
};

const getReportData = async (req, res) => {
  try {
    const { IDs_Informe_Z, IDs_Informe_Radiante, IDs_Informe_Fotometria } = req.query;

    const idsInformeZ = splitIds(IDs_Informe_Z);
    const idsInformeRadiante = splitIds(IDs_Informe_Radiante);
    const idsInformeFotometria = splitIds(IDs_Informe_Fotometria);


    const results = {
      reportData: [],
      reportDataRadiant: [],
      reportDataPhotometry: [],
    };

    if (idsInformeZ.length) {
      const [data] = await pool.query(
        `SELECT iz.IdInforme, iz.Fecha, iz.Hora,
         CONCAT(o1.Número, ' - ', o1.Nombre_Observatorio ) AS Ob1,   
         CONCAT(o2.Número, ' - ', o2.Nombre_Observatorio ) AS Ob2 
         FROM Informe_Z iz 
         LEFT JOIN Observatorio o1 ON iz.Observatorio_Número = o1.Número 
         LEFT JOIN Observatorio o2 ON iz.Observatorio_Número2 = o2.Número 
         WHERE iz.IdInforme IN (?)`,
        [idsInformeZ]
      );
      results.reportData = data;
    }

    if (idsInformeRadiante.length) {
      const [data] = await pool.query(
        `SELECT Identificador, Hora, Fecha, Trayectorias_estimadas_para,
         Distancia_angular_grados, Velocidad_angular_grad_sec,
         CONCAT(o1.Número, ' - ', o1.Nombre_Observatorio ) AS Ob2 
         FROM Informe_Radiante ir 
         LEFT JOIN Observatorio o1 ON ir.Observatorio_Número = o1.Número 
         WHERE Identificador IN (?)`,
        [idsInformeRadiante]
      );
      results.reportDataRadiant = data;
    }

    if (idsInformeFotometria.length) {
      const [data] = await pool.query(
        `SELECT Fecha, Hora, Identificador, Estrellas_visibles,
         Estrellas_usadas_para_regresion 
         FROM Informe_Fotometria 
         WHERE Identificador IN (?)`,
        [idsInformeFotometria]
      );
      results.reportDataPhotometry = data;
    }

    res.json(results);

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
