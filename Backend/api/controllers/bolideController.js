const pool = require('../database/connection');

const { isPointInRadius } = require('../middlewares/isPointInRadius')
const { individuaConvertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal.js')
const { convertCoordinates } = require('../middlewares/convertCoordinates');
const { buildReportZVisibilityCondition } = require('../utils/reportZVisibility');

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
    const [reports] = await pool.query(`SELECT iz.* FROM Informe_Z iz WHERE ${buildReportZVisibilityCondition('iz')}`);
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

const toNullableValue = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return value;
};

const toNullableInteger = (value) => {
  const normalizedValue = toNullableValue(value);
  if (normalizedValue === null) return null;

  const parsedValue = Number(normalizedValue);
  return Number.isInteger(parsedValue) ? parsedValue : null;
};

const normalizeBolidePayload = (payload = {}) => ({
  id: toNullableInteger(payload.Identificador ?? payload.id),
  date: toNullableValue(payload.Fecha ?? payload.date),
  time: toNullableValue(payload.Hora ?? payload.time)
});

const validateBolidePayload = (bolide, includeId = false) => {
  if (includeId && (!Number.isInteger(bolide.id) || bolide.id < 1)) {
    return 'El identificador del bólido debe ser un entero positivo';
  }

  if (!bolide.date) {
    return 'La fecha del bólido es obligatoria';
  }

  return null;
};

const getAdminBolideById = async (id) => {
  const [bolides] = await pool.query(
    'SELECT Identificador, Fecha, Hora FROM Meteoro WHERE Identificador = ?',
    [id]
  );

  return bolides[0] || null;
};

const getAdminBolides = async (req, res) => {
  try {
    const meteorId = toNullableInteger(req.query.meteorId);
    const stationId = toNullableInteger(req.query.stationId);
    const { startDate, endDate } = req.query;
    const whereClauses = ['1=1'];
    const params = [];

    if (meteorId !== null) {
      whereClauses.push('m.Identificador = ?');
      params.push(meteorId);
    }
    if (startDate) {
      whereClauses.push('m.Fecha >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push('m.Fecha <= ?');
      params.push(endDate);
    }
    if (stationId !== null) {
      whereClauses.push(`(
        EXISTS (
          SELECT 1
          FROM Informe_Z iz
          WHERE iz.Meteoro_Identificador = m.Identificador
            AND (iz.\`Observatorio_Número\` = ? OR iz.\`Observatorio_Número2\` = ?)
            AND ${buildReportZVisibilityCondition('iz')}
        )
        OR EXISTS (
          SELECT 1
          FROM Informe_Radiante ir
          WHERE ir.Meteoro_Identificador = m.Identificador
            AND ir.\`Observatorio_Número\` = ?
        )
      )`);
      params.push(stationId, stationId, stationId);
    }

    const [bolides] = await pool.query(
      `
      SELECT m.Identificador, m.Fecha, m.Hora
      FROM Meteoro m
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY m.Fecha DESC, m.Hora DESC, m.Identificador DESC
      LIMIT 250
      `,
      params
    );

    return res.json(bolides);
  } catch (error) {
    console.error('Error al obtener bólidos para administración:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los bólidos' });
  }
};

const createAdminBolide = async (req, res) => {
  const bolide = normalizeBolidePayload(req.body);
  const validationError = validateBolidePayload(bolide, true);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    await pool.query(
      'INSERT INTO Meteoro (Identificador, Fecha, Hora) VALUES (?, ?, ?)',
      [bolide.id, bolide.date, bolide.time]
    );

    return res.status(201).json(await getAdminBolideById(bolide.id));
  } catch (error) {
    console.error('Error al crear bólido:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un bólido con ese identificador' });
    }
    return res.status(500).json({ message: 'No se pudo crear el bólido' });
  }
};

const updateAdminBolide = async (req, res) => {
  const id = toNullableInteger(req.params.id);
  const bolide = normalizeBolidePayload(req.body);
  const validationError = validateBolidePayload(bolide);

  if (id === null) {
    return res.status(400).json({ message: 'Identificador de bólido inválido' });
  }
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const [result] = await pool.query(
      'UPDATE Meteoro SET Fecha = ?, Hora = ? WHERE Identificador = ?',
      [bolide.date, bolide.time, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Bólido no encontrado' });
    }

    return res.json(await getAdminBolideById(id));
  } catch (error) {
    console.error('Error al actualizar bólido:', error);
    return res.status(500).json({ message: 'No se pudo actualizar el bólido' });
  }
};

const deleteAdminBolide = async (req, res) => {
  const id = toNullableInteger(req.params.id);

  if (id === null) {
    return res.status(400).json({ message: 'Identificador de bólido inválido' });
  }

  try {
    const [result] = await pool.query('DELETE FROM Meteoro WHERE Identificador = ?', [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Bólido no encontrado' });
    }

    return res.json({ message: 'Bólido eliminado' });
  } catch (error) {
    console.error('Error al eliminar bólido:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'El bólido tiene informes asociados y no se puede eliminar' });
    }
    return res.status(500).json({ message: 'No se pudo eliminar el bólido' });
  }
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
    ROUND(MAX(if2.MagMax), 2) AS magMax,
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
    AND ${buildReportZVisibilityCondition('iz')}
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
            AND ${buildReportZVisibilityCondition('iz_obs')}
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
      whereClauses.push(`(
        EXISTS (
          SELECT 1
          FROM Lluvia_activa la_sh
          WHERE la_sh.Informe_Z_IdInforme IN (
            SELECT iz_sh.IdInforme
            FROM Informe_Z iz_sh
            WHERE iz_sh.Meteoro_Identificador = m.Identificador
              AND ${buildReportZVisibilityCondition('iz_sh')}
          )
            AND la_sh.Lluvia_Identificador LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM Lluvia_Activa_InfRad lair_sh
          JOIN Informe_Radiante ir_sh ON ir_sh.Identificador = lair_sh.Informe_Radiante_Identificador
          WHERE ir_sh.Meteoro_Identificador = m.Identificador
            AND lair_sh.Lluvia_Identificador LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM Informe_Radiante ir_name_sh
          WHERE ir_name_sh.Meteoro_Identificador = m.Identificador
            AND ir_name_sh.Lluvia_Asociada LIKE ?
        )
      )`);
      whereParams.push(`%${showerFilter}%`, `%${showerFilter}%`, `%${showerFilter}%`);
    }

    const havingClauses = ['1=1'];
    const havingParams = [];

    switch (reportType) {
      case '2':
        whereClauses.push(`EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`);
        break;
      case '3':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '4':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '5':
        whereClauses.push(
          `EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`,
          'EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)'
        );
        break;
      default:
        break;
    }

    if (parseBoolean(requireReportZ)) {
      whereClauses.push(`EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`);
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
          AND ${buildReportZVisibilityCondition('iz_h')}
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
          AND ${buildReportZVisibilityCondition('iz_v')}
          AND iz_v.Velocidad_media >= ?
      )`);
      whereParams.push(minVelocityValue);
    }
    if (maxVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND ${buildReportZVisibilityCondition('iz_v')}
          AND iz_v.Velocidad_media <= ?
      )`);
      whereParams.push(maxVelocityValue);
    }
    let minMagMaxValue = parseNumber(minMagMaxFilter);
    let maxMagMaxValue = parseNumber(maxMagMaxFilter);
    if (reportType !== '4') {
      minMagMaxValue = null;
      maxMagMaxValue = null;
    }
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
    if (reportType !== '4') {
      minMassValue = null;
      maxMassValue = null;
    }
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
            AND ${buildReportZVisibilityCondition('iz_obs')}
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
      whereClauses.push(`(
        EXISTS (
          SELECT 1
          FROM Lluvia_activa la_sh
          WHERE la_sh.Informe_Z_IdInforme IN (
            SELECT iz_sh.IdInforme
            FROM Informe_Z iz_sh
            WHERE iz_sh.Meteoro_Identificador = m.Identificador
              AND ${buildReportZVisibilityCondition('iz_sh')}
          )
            AND la_sh.Lluvia_Identificador LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM Lluvia_Activa_InfRad lair_sh
          JOIN Informe_Radiante ir_sh ON ir_sh.Identificador = lair_sh.Informe_Radiante_Identificador
          WHERE ir_sh.Meteoro_Identificador = m.Identificador
            AND lair_sh.Lluvia_Identificador LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM Informe_Radiante ir_name_sh
          WHERE ir_name_sh.Meteoro_Identificador = m.Identificador
            AND ir_name_sh.Lluvia_Asociada LIKE ?
        )
      )`);
      whereParams.push(`%${showerFilter}%`, `%${showerFilter}%`, `%${showerFilter}%`);
    }

    const havingClauses = ['1=1'];
    const havingParams = [];

    switch (reportType) {
      case '2':
        whereClauses.push(`EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`);
        break;
      case '3':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '4':
        whereClauses.push('EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)');
        break;
      case '5':
        whereClauses.push(
          `EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`,
          'EXISTS (SELECT 1 FROM Informe_Radiante ir_req WHERE ir_req.Meteoro_Identificador = m.Identificador)',
          'EXISTS (SELECT 1 FROM Informe_Fotometria if_req WHERE if_req.Meteoro_Identificador = m.Identificador)'
        );
        break;
      default:
        break;
    }

    if (parseBoolean(requireReportZ)) {
      whereClauses.push(`EXISTS (SELECT 1 FROM Informe_Z iz_req WHERE iz_req.Meteoro_Identificador = m.Identificador AND ${buildReportZVisibilityCondition('iz_req')})`);
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
          AND ${buildReportZVisibilityCondition('iz_h')}
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
          AND ${buildReportZVisibilityCondition('iz_v')}
          AND iz_v.Velocidad_media >= ?
      )`);
      whereParams.push(minVelocityValue);
    }
    if (maxVelocityValue !== null) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM Informe_Z iz_v
        WHERE iz_v.Meteoro_Identificador = m.Identificador
          AND ${buildReportZVisibilityCondition('iz_v')}
          AND iz_v.Velocidad_media <= ?
      )`);
      whereParams.push(maxVelocityValue);
    }

    let minMagMaxValue = parseNumber(minMagMaxFilter);
    let maxMagMaxValue = parseNumber(maxMagMaxFilter);
    if (reportType !== '4') {
      minMagMaxValue = null;
      maxMagMaxValue = null;
    }
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
    if (reportType !== '4') {
      minMassValue = null;
      maxMassValue = null;
    }
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
         WHERE iz.IdInforme IN (?)
           AND ${buildReportZVisibilityCondition('iz')}`,
        [idsInformeZ]
      );
      results.reportData = data;
    }

    if (idsInformeRadiante.length) {
      const [data] = await pool.query(
        `SELECT Identificador, Hora, Fecha, Trayectorias_estimadas_para,
         Distancia_angular_grados, Velocidad_angular_grad_sec,
         Lluvia_Asociada,
         CONCAT(o1.Número, ' - ', o1.Nombre_Observatorio ) AS Observatorio_Número 
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

const formatSqlDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const formatSqlTime = (value) => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{2}:\d{2}:\d{2})/);
  return match ? match[1] : String(value).trim();
};

const normalizeNumericValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(String(value).trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const safeConvertCoordinates = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    const converted = convertCoordinates(value);

    return {
      latitude: normalizeNumericValue(converted.latitude),
      longitude: normalizeNumericValue(converted.longitude),
      altitudeKm: normalizeNumericValue(converted.height),
      distanceKm: normalizeNumericValue(converted.distance)
    };
  } catch (error) {
    return null;
  }
};

const averageFiniteValues = (values) => {
  const validValues = values.filter(value => Number.isFinite(value));
  if (!validValues.length) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const averageGeoPoints = (points) => {
  const validPoints = points.filter(point => point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
  if (!validPoints.length) {
    return null;
  }

  return {
    latitude: averageFiniteValues(validPoints.map(point => point.latitude)),
    longitude: averageFiniteValues(validPoints.map(point => point.longitude)),
    altitudeKm: averageFiniteValues(validPoints.map(point => point.altitudeKm)),
    distanceKm: averageFiniteValues(validPoints.map(point => point.distanceKm))
  };
};

const splitDistinctText = (value) => {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      String(value)
        .split('/')
        .map(item => item.trim())
        .filter(Boolean)
    )
  );
};

const normalizeCoordinateRange = (value) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  if (Math.abs(value) > 180) {
    return value + (value > 0 ? -360 : 360);
  }

  return value;
};

const subtractDays = (dateString, days) => {
  const baseDate = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(baseDate.getTime())) {
    return dateString;
  }

  baseDate.setUTCDate(baseDate.getUTCDate() - days);
  return baseDate.toISOString().slice(0, 10);
};

const buildObservatorySummary = (row) => {
  const observatories = [];

  if (row.observatory1Number) {
    observatories.push({
      id: Number(row.observatory1Number),
      name: row.observatory1Name || `Observatorio ${row.observatory1Number}`
    });
  }

  if (row.observatory2Number) {
    observatories.push({
      id: Number(row.observatory2Number),
      name: row.observatory2Name || `Observatorio ${row.observatory2Number}`
    });
  }

  return Array.from(
    new Map(observatories.map(item => [item.id, item])).values()
  );
};

const buildMeasuredTrajectoryPoints = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => ({
      latitude: normalizeCoordinateRange(individuaConvertSexagesimalToDecimal(row.phi)),
      longitude: normalizeCoordinateRange(individuaConvertSexagesimalToDecimal(row.lambda)),
      distanceKm: normalizeNumericValue(row.s),
      timeSeconds: normalizeNumericValue(row.t),
      velocityKmS: normalizeNumericValue(row.v)
    }))
    .filter(point => Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
    .sort((left, right) => {
      const leftOrder = Number.isFinite(left.distanceKm) ? left.distanceKm : left.timeSeconds;
      const rightOrder = Number.isFinite(right.distanceKm) ? right.distanceKm : right.timeSeconds;

      if (Number.isFinite(leftOrder) && Number.isFinite(rightOrder)) {
        return leftOrder - rightOrder;
      }

      if (Number.isFinite(leftOrder)) return -1;
      if (Number.isFinite(rightOrder)) return 1;
      return 0;
    });
};

const getReportQualityScore = (report) => {
  const measuredPoints = report.measuredPointCount || 0;
  const hasRepresentativePath = report.startPoint && report.endPoint ? 1 : 0;
  const trajectoryLength = Number.isFinite(report.trajectoryLengthKm) ? report.trajectoryLengthKm : 0;
  const regressionPoints = report.regressionPointCount || 0;
  const errorVelocityPenalty = Number.isFinite(report.errorVelocityKmS) ? Math.min(report.errorVelocityKmS, 999) : 999;

  return (
    measuredPoints * 1000000 +
    hasRepresentativePath * 100000 +
    trajectoryLength * 100 +
    regressionPoints -
    errorVelocityPenalty
  );
};

const getBolideTrajectoriesForEarthGlobe = async (req, res) => {
  try {
    const [rangeRows] = await pool.query(`
      SELECT
        MIN(m.Fecha) AS minDate,
        MAX(m.Fecha) AS maxDate
      FROM Meteoro m
      WHERE EXISTS (
        SELECT 1
        FROM Informe_Z iz
        WHERE iz.Meteoro_Identificador = m.Identificador
          AND ${buildReportZVisibilityCondition('iz')}
      )
    `);

    const availableRange = {
      minDate: formatSqlDate(rangeRows[0]?.minDate),
      maxDate: formatSqlDate(rangeRows[0]?.maxDate)
    };

    if (!availableRange.minDate || !availableRange.maxDate) {
      return res.json({
        availableRange,
        queryRange: {
          startDate: null,
          endDate: null
        },
        meta: {
          totalBolides: 0,
          totalReports: 0,
          totalMeasuredPoints: 0
        },
        data: []
      });
    }

    const requestedStart = parseText(req.query.startDate);
    const requestedEnd = parseText(req.query.endDate);
    let startDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedStart)
      ? requestedStart
      : subtractDays(availableRange.maxDate, 30);
    let endDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedEnd)
      ? requestedEnd
      : availableRange.maxDate;

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    const [reportRows] = await pool.query(`
      SELECT
        iz.IdInforme AS reportId,
        iz.Meteoro_Identificador AS meteorId,
        m.Fecha AS meteorDate,
        m.Hora AS meteorTime,
        iz.Fecha AS reportDate,
        iz.Hora AS reportTime,
        iz.\`Observatorio_Número\` AS observatory1Number,
        iz.\`Observatorio_Número2\` AS observatory2Number,
        o1.Nombre_Observatorio AS observatory1Name,
        o2.Nombre_Observatorio AS observatory2Name,
        iz.Inicio_de_la_trayectoria_Estacion_1,
        iz.Fin_de_la_trayectoria_Estacion_1,
        iz.Inicio_de_la_trayectoria_Estacion_2,
        iz.Fin_de_la_trayectoria_Estacion_2,
        iz.Impacto_previsible,
        iz.Distancia_recorrida_Estacion_1,
        iz.Distancia_recorrida_Estacion_2,
        iz.Tiempo_Estacion_1,
        iz.Tiempo_trayectoria_en_estacion_2,
        iz.Velocidad_media,
        iz.Error_Velocidad,
        iz.Aceleración_en_Kms,
        COALESCE(tmStats.pointCount, 0) AS measuredPointCount,
        COALESCE(trStats.pointCount, 0) AS regressionPointCount,
        radiantStats.associatedShowers,
        radiantStats.angularVelocityDegS,
        photometryStats.magMax,
        photometryStats.photometricMass
      FROM Informe_Z iz
      JOIN Meteoro m ON m.Identificador = iz.Meteoro_Identificador
      LEFT JOIN Observatorio o1 ON o1.\`Número\` = iz.\`Observatorio_Número\`
      LEFT JOIN Observatorio o2 ON o2.\`Número\` = iz.\`Observatorio_Número2\`
      LEFT JOIN (
        SELECT
          Informe_Z_IdInforme,
          COUNT(*) AS pointCount
        FROM Trayectoria_medida
        GROUP BY Informe_Z_IdInforme
      ) tmStats ON tmStats.Informe_Z_IdInforme = iz.IdInforme
      LEFT JOIN (
        SELECT
          Informe_Z_IdInforme,
          COUNT(*) AS pointCount
        FROM Trayectoria_por_regresion
        GROUP BY Informe_Z_IdInforme
      ) trStats ON trStats.Informe_Z_IdInforme = iz.IdInforme
      LEFT JOIN (
        SELECT
          Meteoro_Identificador,
          GROUP_CONCAT(DISTINCT Lluvia_Asociada ORDER BY Lluvia_Asociada SEPARATOR ' / ') AS associatedShowers,
          MAX(Velocidad_angular_grad_sec) AS angularVelocityDegS
        FROM Informe_Radiante
        GROUP BY Meteoro_Identificador
      ) radiantStats ON radiantStats.Meteoro_Identificador = iz.Meteoro_Identificador
      LEFT JOIN (
        SELECT
          Meteoro_Identificador,
          MAX(MagMax) AS magMax,
          MAX(Masa_fotometrica) AS photometricMass
        FROM Informe_Fotometria
        GROUP BY Meteoro_Identificador
      ) photometryStats ON photometryStats.Meteoro_Identificador = iz.Meteoro_Identificador
      WHERE m.Fecha BETWEEN ? AND ?
        AND ${buildReportZVisibilityCondition('iz')}
      ORDER BY m.Fecha DESC, m.Hora DESC, iz.IdInforme DESC
    `, [startDate, endDate]);

    if (!reportRows.length) {
      return res.json({
        availableRange,
        queryRange: {
          startDate,
          endDate
        },
        meta: {
          totalBolides: 0,
          totalReports: 0,
          totalMeasuredPoints: 0
        },
        data: []
      });
    }

    const reportIds = reportRows.map(row => Number(row.reportId)).filter(Number.isFinite);
    const [trajectoryRows] = await pool.query(`
      SELECT
        Informe_Z_IdInforme,
        Hora,
        s,
        t,
        v,
        lambda,
        phi
      FROM Trayectoria_medida
      WHERE Informe_Z_IdInforme IN (?)
      ORDER BY
        Informe_Z_IdInforme ASC,
        COALESCE(s, 999999999) ASC,
        COALESCE(t, 999999999) ASC,
        Hora ASC
    `, [reportIds]);

    const trajectoryByReport = new Map();
    trajectoryRows.forEach((row) => {
      const reportId = Number(row.Informe_Z_IdInforme);
      if (!trajectoryByReport.has(reportId)) {
        trajectoryByReport.set(reportId, []);
      }

      trajectoryByReport.get(reportId).push(row);
    });

    const meteorMap = new Map();

    reportRows.forEach((row) => {
      const reportId = Number(row.reportId);
      const trajectoryPoints = buildMeasuredTrajectoryPoints(trajectoryByReport.get(reportId));
      const startStation1 = safeConvertCoordinates(row.Inicio_de_la_trayectoria_Estacion_1);
      const endStation1 = safeConvertCoordinates(row.Fin_de_la_trayectoria_Estacion_1);
      const startStation2 = safeConvertCoordinates(row.Inicio_de_la_trayectoria_Estacion_2);
      const endStation2 = safeConvertCoordinates(row.Fin_de_la_trayectoria_Estacion_2);
      const impactPoint = safeConvertCoordinates(`${row.Impacto_previsible || ''} 0.0 0.0`);
      const report = {
        reportId,
        observatories: buildObservatorySummary(row),
        measuredPointCount: Number(row.measuredPointCount) || trajectoryPoints.length,
        regressionPointCount: Number(row.regressionPointCount) || 0,
        velocityKmS: normalizeNumericValue(row.Velocidad_media),
        errorVelocityKmS: normalizeNumericValue(row.Error_Velocidad),
        accelerationKmS2: normalizeNumericValue(row.Aceleración_en_Kms),
        angularVelocityDegS: normalizeNumericValue(row.angularVelocityDegS),
        trajectoryLengthKm: averageFiniteValues([
          normalizeNumericValue(row.Distancia_recorrida_Estacion_1),
          normalizeNumericValue(row.Distancia_recorrida_Estacion_2)
        ]),
        durationSeconds: averageFiniteValues([
          normalizeNumericValue(row.Tiempo_Estacion_1),
          normalizeNumericValue(row.Tiempo_trayectoria_en_estacion_2)
        ]),
        startPoint: averageGeoPoints([startStation1, startStation2]),
        endPoint: averageGeoPoints([endStation1, endStation2]),
        impactPoint,
        trajectoryPoints
      };

      const meteorId = Number(row.meteorId);
      if (!meteorMap.has(meteorId)) {
        meteorMap.set(meteorId, {
          meteorId,
          date: formatSqlDate(row.meteorDate || row.reportDate),
          time: formatSqlTime(row.meteorTime || row.reportTime),
          associatedShowers: new Set(splitDistinctText(row.associatedShowers)),
          observatoryMap: new Map(),
          reportIds: [],
          reports: [],
          angularVelocityDegS: normalizeNumericValue(row.angularVelocityDegS),
          magnitude: normalizeNumericValue(row.magMax),
          photometricMass: normalizeNumericValue(row.photometricMass)
        });
      }

      const meteorEntry = meteorMap.get(meteorId);
      meteorEntry.reports.push(report);
      meteorEntry.reportIds.push(reportId);
      report.observatories.forEach((observatory) => {
        meteorEntry.observatoryMap.set(observatory.id, observatory);
      });

      splitDistinctText(row.associatedShowers).forEach(item => meteorEntry.associatedShowers.add(item));
      meteorEntry.angularVelocityDegS = meteorEntry.angularVelocityDegS ?? normalizeNumericValue(row.angularVelocityDegS);
      meteorEntry.magnitude = meteorEntry.magnitude ?? normalizeNumericValue(row.magMax);
      meteorEntry.photometricMass = meteorEntry.photometricMass ?? normalizeNumericValue(row.photometricMass);
    });

    const data = Array.from(meteorMap.values())
      .map((entry) => {
        const selectedReport = entry.reports.reduce((bestReport, currentReport) => {
          if (!bestReport) {
            return currentReport;
          }

          return getReportQualityScore(currentReport) > getReportQualityScore(bestReport)
            ? currentReport
            : bestReport;
        }, null);

        if (!selectedReport?.startPoint || !selectedReport?.endPoint) {
          return null;
        }

        return {
          meteorId: entry.meteorId,
          date: entry.date,
          time: entry.time,
          reportCount: entry.reports.length,
          reportIds: entry.reportIds.sort((left, right) => right - left),
          selectedReportId: selectedReport.reportId,
          observatories: Array.from(entry.observatoryMap.values()),
          associatedShowers: Array.from(entry.associatedShowers.values()),
          velocityKmS: selectedReport.velocityKmS,
          angularVelocityDegS: entry.angularVelocityDegS,
          magnitude: entry.magnitude,
          photometricMass: entry.photometricMass,
          accelerationKmS2: selectedReport.accelerationKmS2,
          measuredPointCount: selectedReport.measuredPointCount,
          regressionPointCount: selectedReport.regressionPointCount,
          trajectoryLengthKm: selectedReport.trajectoryLengthKm,
          durationSeconds: selectedReport.durationSeconds,
          startPoint: selectedReport.startPoint,
          endPoint: selectedReport.endPoint,
          impactPoint: selectedReport.impactPoint,
          path: selectedReport.trajectoryPoints,
          reportSummaries: entry.reports
            .map(report => ({
              reportId: report.reportId,
              measuredPointCount: report.measuredPointCount,
              regressionPointCount: report.regressionPointCount,
              velocityKmS: report.velocityKmS,
              trajectoryLengthKm: report.trajectoryLengthKm,
              durationSeconds: report.durationSeconds,
              observatories: report.observatories
            }))
            .sort((left, right) => right.measuredPointCount - left.measuredPointCount || right.reportId - left.reportId)
        };
      })
      .filter(Boolean)
      .sort((left, right) => {
        const leftKey = `${left.date || ''} ${left.time || ''}`;
        const rightKey = `${right.date || ''} ${right.time || ''}`;
        return rightKey.localeCompare(leftKey) || right.meteorId - left.meteorId;
      });

    res.json({
      availableRange,
      queryRange: {
        startDate,
        endDate
      },
      meta: {
        totalBolides: data.length,
        totalReports: reportRows.length,
        totalMeasuredPoints: data.reduce((sum, item) => sum + (item.measuredPointCount || 0), 0)
      },
      data
    });
  } catch (error) {
    console.error('Error al obtener trayectorias 3D de bólidos:', error);
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
  getBolideTrajectoriesForEarthGlobe,
  testing,
  getReportData,
  getBolideWithCustomSearchCSV,
  getAdminBolides,
  createAdminBolide,
  updateAdminBolide,
  deleteAdminBolide
};
