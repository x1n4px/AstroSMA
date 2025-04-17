const path = require('path');
const fs = require('fs');
const pool = require('../database/connection');
require('dotenv').config();
const os = require('os');


const getOrbitFile = (req, res) => {
  const { anio, mes, dia, hora, minuto, segundo, fileName } = req.params;

  // Validación básica
  if (![anio, mes, dia, hora, minuto, segundo].every(p => /^\d+$/.test(p))) {
    return res.status(400).json({ error: 'Todos los parámetros deben ser numéricos' });
  }

  // Asegurar formato correcto (rellenando con ceros si es necesario)
  const yyyy = anio.padStart(4, '0');
  const MM = mes.padStart(2, '0');
  const dd = dia.padStart(2, '0');
  const hh = hora.padStart(2, '0');
  const mm = minuto.padStart(2, '0');
  const ss = segundo.padStart(2, '0');

  const formattedDate = `${yyyy}${MM}${dd}`;
  const formattedTime = `${hh}${mm}${ss}`;
  const homeDir = os.homedir();
  console.log(homeDir)
  const filePath = path.join(
    homeDir+'/sma/Meteoros/Detecciones/'+
    yyyy+'/'+    formattedDate+'/'+
    formattedTime+'/'+
    fileName
  );

  console.log( homeDir+'/sma/Meteoros/Detecciones/'+
    yyyy+'/'+    formattedDate+'/'+
    formattedTime+'/'+
    fileName)

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.download(filePath, 'UFOORBIT.trz', (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        res.status(500).send('Error al enviar el archivo');
      }
    });
  });
};

module.exports = {
  getOrbitFile,
};
