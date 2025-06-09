const path = require('path');
const fs = require('fs');
const pool = require('../database/connection');
require('dotenv').config();
const os = require('os');


const getOrbitFile = (req, res) => {
  const {
    button,
    year, month, day,
    hour, minute, second,
    fileName,
    id1, id2
  } = req.query;


  if (!button || !year || !month || !day || !hour || !minute || !second || !fileName) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }

  const fullPath = process.env.FULL_PATH;
  console.log('Full path:', fullPath);
  // Asegurar formato correcto (rellenando con ceros si es necesario)
  const pathToBase = '/sma/Meteoros/Detecciones/';

  const formattedDate = `${year}${month}${day}`;
  const formattedTime = `${hour}${minute}${second}`;
  const formatFull = `${year}${month}${day}${hour}${minute}${second}`;
  const homeDir = os.homedir();
  let filePath = '';

  if (button === 'UFOORBIT') {
    filePath = path.join(
      fullPath + year + '/' + formattedDate + '/' + formattedTime + '/' +
      fileName
    );
  } else if (button === 'WMPL') {
    filePath = path.join(
      fullPath + year + '/' + formattedDate + '/' + formattedTime + '/' +
      fileName
    );
  } else if (button === 'GRITSEVICH') {
    filePath = path.join(
      fullPath + year + '/' + formattedDate + '/' + formattedTime + '/' +
      'Trayectoria-' + id1 + '-' + id2 + '/Gritsevich-' 
      + formatFull + '-' + id1 + '-' + id2 + '/' +
      fileName
    );
  } else if (button === 'METEORGLOW') {
    filePath = path.join(
      fullPath + year + '/' + formattedDate + '/' + formattedTime + '/' + 
      'Trayectoria-'+id1+'-'+id2+'/Magnitudes-'+year+month+day+hour+minute+second+'-'+id1+'-'+id2+'/'
    );
  } else if (button === 'RAWDATA') {
    filePath = path.join(
      fullPath + year + '/' + formattedDate + '/' + formattedTime + '/' + 
      'Trayectoria-'+id1+'-'+id2+'/Coordenadas-'+year+month+day+hour+minute+second+'-'+id1+'.csv'
    );
  }
  console.log(filePath)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
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
