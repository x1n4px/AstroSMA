const path = require('path');
const fs = require('fs');
require('dotenv').config();


const getOrbitFile = (req, res) => {
  const {
    date,
    time,
    fileName,
    year,
    month,
    day,
    hour,
    minute,
    second
  } = req.query;

  if (!fileName) {
    return res.status(400).json({ error: 'Falta el nombre de fichero a descargar' });
  }

  const fullPath = process.env.FULL_PATH;
  console.log('[getOrbitFile] FULL_PATH=', fullPath);
  console.log('[getOrbitFile] RAW_QUERY=', JSON.stringify(req.query || {}));
  if (!fullPath) {
    return res.status(500).json({ error: 'FULL_PATH no está configurado' });
  }

  const normalizeDate = (inputDate) => {
    const value = String(inputDate || '').trim();

    // Caso ISO/UTC: convertir a fecha local Europe/Madrid para evitar desfase de día.
    if (value.includes('T')) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Madrid',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(parsed);
        const year = parts.find((p) => p.type === 'year')?.value;
        const month = parts.find((p) => p.type === 'month')?.value;
        const day = parts.find((p) => p.type === 'day')?.value;
        if (year && month && day) {
          return { year, month, day };
        }
      }
    }

    const match = value.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    if (!match) return null;
    return { year: match[1], month: match[2], day: match[3] };
  };

  const normalizeTime = (inputTime) => {
    const value = String(inputTime || '').trim();
    const match = value.match(/(\d{2}):?(\d{2}):?(\d{2})/);
    if (!match) return null;
    return { hour: match[1], minute: match[2], second: match[3] };
  };

  const dateParts = normalizeDate(date) || (
    year && month && day ? { year: String(year).padStart(4, '0'), month: String(month).padStart(2, '0'), day: String(day).padStart(2, '0') } : null
  );
  const timeParts = normalizeTime(time) || (
    hour && minute && second ? { hour: String(hour).padStart(2, '0'), minute: String(minute).padStart(2, '0'), second: String(second).padStart(2, '0') } : null
  );

  if (!dateParts || !timeParts) {
    console.warn('[getOrbitFile] INVALID_DATE_OR_TIME', JSON.stringify({ date, time, year, month, day, hour, minute, second }));
    return res.status(400).json({ error: 'Fecha u hora inválida para construir la ruta' });
  }

  const safeFileName = path.basename(String(fileName));
  const formattedDate = `${dateParts.year}${dateParts.month}${dateParts.day}`;
  const formattedTime = `${timeParts.hour}${timeParts.minute}${timeParts.second}`;
  const normalizedFullPath = path.resolve(fullPath);
  const deteccionesSuffix = path.join('home', 'sma', 'Meteoros', 'Detecciones');
  const hasDeteccionesSuffix = normalizedFullPath.endsWith(deteccionesSuffix);
  // conejo: Cambio esto porque los directorios no salen bien
  // const deteccionesRoot = hasDeteccionesSuffix
  //   ? normalizedFullPath
  //   : path.resolve(normalizedFullPath, deteccionesSuffix);
  const deteccionesRoot = normalizedFullPath;
  const baseFolder = path.resolve(deteccionesRoot, dateParts.year, formattedDate, formattedTime);
  const filePath = path.resolve(baseFolder, safeFileName);

  console.log(
    '[getOrbitFile] request=',
    JSON.stringify({
      date,
      time,
      fileName,
      safeFileName,
      year: dateParts.year,
      yyyymmdd: formattedDate,
      hhmmss: formattedTime,
      normalizedFullPath,
      deteccionesRoot,
      hasDeteccionesSuffix
    })
  );
  console.log('[getOrbitFile] baseFolder=', baseFolder);
  console.log('[getOrbitFile] filePath=', filePath);

  if (!filePath.startsWith(`${baseFolder}${path.sep}`) && filePath !== path.join(baseFolder, safeFileName)) {
    console.warn('[getOrbitFile] INVALID_PATH', filePath);
    return res.status(400).json({ error: 'Ruta de archivo inválida' });
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.warn('[getOrbitFile] NOT_FOUND', filePath);
      return res.status(404).json({
        error: 'Archivo no encontrado',
        path: filePath
      });
    }

    console.log('[getOrbitFile] FOUND', filePath);
    res.download(filePath, safeFileName, (err) => {
      if (err) {
        console.error('[getOrbitFile] SEND_ERROR', filePath, err);
        res.status(500).send('Error al enviar el archivo');
      }
    });
  });
};




const testing = (req, res) => {
  try {
    res.status(200).json("Prueba exitosa");
  }catch (error) {
    console.error('Error en la función de prueba:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getOrbitFile, testing
};
