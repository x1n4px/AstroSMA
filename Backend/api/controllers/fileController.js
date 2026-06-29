const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { resolveDetectionContext } = require('../utils/detectionFolder');


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

    const detectionContext = resolveDetectionContext(
      date || (year && month && day ? `${year}-${month}-${day}` : ''),
      time || (hour && minute && second ? `${hour}:${minute}:${second}` : '')
    );

    if (!detectionContext) {
      console.warn('[getOrbitFile] INVALID_DATE_OR_TIME', JSON.stringify({ date, time, year, month, day, hour, minute, second }));
      return res.status(400).json({ error: 'Fecha u hora inválida para construir la ruta' });
    }

    const {
      dateParts,
      timeParts,
      deteccionesRoot,
      eventFolder,
      formattedDate,
      formattedTime
    } = detectionContext;

    const safeFileName = path.basename(String(fileName));
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
    const candidatePaths = candidateRoots.map((candidateRoot) => path.resolve(candidateRoot, safeFileName));

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
        year: dateParts.year,
        yyyymmdd: formattedDate,
        hhmmss: formattedTime,
        deteccionesRoot
      })
    );
    console.log('[getOrbitFile] eventFolder=', eventFolder);
    console.log('[getOrbitFile] candidatePaths=', JSON.stringify(candidatePaths));

    const invalidPath = candidatePaths.find((candidatePath, index) => {
      const root = candidateRoots[index];
      return !candidatePath.startsWith(`${root}${path.sep}`) && candidatePath !== path.join(root, safeFileName);
    });

    if (invalidPath) {
      console.warn('[getOrbitFile] INVALID_PATH', invalidPath);
      return res.status(400).json({ error: 'Ruta de archivo inválida' });
    }

    const filePath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

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
