const path = require('path');
const fs = require('fs');
require('dotenv').config();

function normalizeDateParts(inputDate) {
  const value = String(inputDate || '').trim();
  const match = value.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);

  if (!match) {
    return null;
  }

  return { year: match[1], month: match[2], day: match[3] };
}

function normalizeTimeParts(inputTime) {
  const value = String(inputTime || '').trim();
  const match = value.match(/(\d{2}):?(\d{2}):?(\d{2})/);

  if (!match) {
    return null;
  }

  return { hour: match[1], minute: match[2], second: match[3] };
}

function shiftDateParts(dateParts, offsetDays) {
  const year = Number(dateParts.year);
  const month = Number(dateParts.month);
  const day = Number(dateParts.day);

  if (![year, month, day].every(Number.isInteger)) {
    return null;
  }

  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);

  return {
    year: String(shifted.getUTCFullYear()).padStart(4, '0'),
    month: String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    day: String(shifted.getUTCDate()).padStart(2, '0')
  };
}

function buildDetectionContext(dateParts, timeParts, fullPath) {
  if (!fullPath || !dateParts || !timeParts) {
    return null;
  }

  const deteccionesRoot = path.resolve(fullPath);
  const formattedDate = `${dateParts.year}${dateParts.month}${dateParts.day}`;
  const formattedTime = `${timeParts.hour}${timeParts.minute}${timeParts.second}`;
  const eventFolder = path.resolve(deteccionesRoot, dateParts.year, formattedDate, formattedTime);

  return {
    dateParts,
    timeParts,
    deteccionesRoot,
    eventFolder,
    formattedDate,
    formattedTime
  };
}

function buildOrbitFileCandidates({ button, safeFileName, id1, id2, detectionContext }) {
  const { deteccionesRoot, eventFolder } = detectionContext;
  const stationIds = [id1, id2].map((value) => String(value || '').trim()).filter(Boolean);
  const pairFolders = stationIds.length === 2
    ? [`${stationIds[0]}-${stationIds[1]}`, `${stationIds[1]}-${stationIds[0]}`]
    : [];

  const candidateRoots = button === 'WMPL_PROGRAM'
    ? [deteccionesRoot]
    : [
        eventFolder,
        ...pairFolders.map((pairFolder) => path.resolve(eventFolder, pairFolder))
      ];

  return {
    candidateRoots,
    candidatePaths: candidateRoots.map((candidateRoot) => path.resolve(candidateRoot, safeFileName))
  };
}


const getOrbitFile = (req, res) => {
  try {
    const {
      button,
      date,
      time,
      fileName,
      id1,
      id2,
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

    const inputDate = date || (year && month && day ? `${year}-${month}-${day}` : '');
    const inputTime = time || (hour && minute && second ? `${hour}:${minute}:${second}` : '');
    const rawDateParts = normalizeDateParts(inputDate);
    const timeParts = normalizeTimeParts(inputTime);
    const dawnCutoffHour = Number(process.env.DAWN_CUTOFF_HOUR ?? 8);
    const hourNumber = timeParts ? Number(timeParts.hour) : Number.NaN;
    const isBeforeDawn = Number.isInteger(hourNumber) && hourNumber < dawnCutoffHour;
    const observationDateParts = isBeforeDawn ? shiftDateParts(rawDateParts, -1) : rawDateParts;
    const rawDetectionContext = buildDetectionContext(rawDateParts, timeParts, fullPath);
    const observationDetectionContext = buildDetectionContext(observationDateParts, timeParts, fullPath);

    if (!rawDetectionContext || !observationDetectionContext) {
      console.warn('[getOrbitFile] INVALID_DATE_OR_TIME', JSON.stringify({ date, time, year, month, day, hour, minute, second }));
      return res.status(400).json({ error: 'Fecha u hora inválida para construir la ruta' });
    }

    const safeFileName = path.basename(String(fileName));
    const contextsToSearch = rawDetectionContext.eventFolder === observationDetectionContext.eventFolder
      ? [rawDetectionContext]
      : [rawDetectionContext, observationDetectionContext];

    console.log(
      '[getOrbitFile] SEARCH_CONTEXT',
      JSON.stringify({
        inputDate,
        inputTime,
        dawnCutoffHour,
        isBeforeDawn,
        rawEventFolder: rawDetectionContext.eventFolder,
        observationEventFolder: observationDetectionContext.eventFolder,
        fallbackEnabled: rawDetectionContext.eventFolder !== observationDetectionContext.eventFolder
      })
    );

    const candidateSets = contextsToSearch.map((context) => {
      const { candidateRoots, candidatePaths } = buildOrbitFileCandidates({
        button,
        safeFileName,
        id1,
        id2,
        detectionContext: context
      });

      return { context, candidateRoots, candidatePaths };
    });

    const candidatePaths = candidateSets.flatMap((set) => set.candidatePaths);
    const selectedContext = observationDetectionContext;

    console.log(
      '[getOrbitFile] request=',
      JSON.stringify({
        button,
        date,
        time,
        fileName,
        safeFileName,
        id1,
        id2,
        year: selectedContext.dateParts.year,
        yyyymmdd: selectedContext.formattedDate,
        hhmmss: selectedContext.formattedTime,
        deteccionesRoot: selectedContext.deteccionesRoot
      })
    );
    console.log('[getOrbitFile] eventFolder=', selectedContext.eventFolder);
    console.log('[getOrbitFile] candidatePaths=', JSON.stringify(candidatePaths));

    const invalidPath = candidateSets.flatMap(({ candidateRoots, candidatePaths: setCandidatePaths }) =>
      setCandidatePaths.map((candidatePath, index) => ({
        candidatePath,
        root: candidateRoots[index]
      }))
    ).find(({ candidatePath, root }) => {
      return !candidatePath.startsWith(`${root}${path.sep}`) && candidatePath !== path.join(root, safeFileName);
    });

    if (invalidPath) {
      console.warn('[getOrbitFile] INVALID_PATH', invalidPath.candidatePath);
      return res.status(400).json({ error: 'Ruta de archivo inválida' });
    }

    let filePath = null;
    for (const candidatePath of candidatePaths) {
      const exists = fs.existsSync(candidatePath);
      console.log(
        '[getOrbitFile] CHECK_PATH',
        JSON.stringify({
          candidatePath,
          exists
        })
      );

      if (exists) {
        filePath = candidatePath;
        break;
      }
    }

    if (!filePath) {
      console.warn('[getOrbitFile] NOT_FOUND', JSON.stringify(candidatePaths));
      return res.status(404).json({
        error: 'Archivo no encontrado',
        path: candidatePaths[0],
        candidates: candidatePaths
      });
    }

    console.log('[getOrbitFile] FOUND', filePath);
    return res.download(filePath, safeFileName, (err) => {
      if (err) {
        console.error('[getOrbitFile] SEND_ERROR', filePath, err);
        if (!res.headersSent) {
          res.status(500).send('Error al enviar el archivo');
        }
      }
    });
  } catch (error) {
    console.error('[getOrbitFile] UNEXPECTED_ERROR', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
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
