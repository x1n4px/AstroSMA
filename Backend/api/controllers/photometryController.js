const pool = require('../database/connection');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getPhotometryFromId = async (req, res) => {
    try {
        const { selectedId } = req.params;
        const [photometryArray] = await pool.query('SELECT * FROM Informe_Fotometria where Identificador = ?', [selectedId]);
        const [regressionStart] = await pool.query('select * FROM Estrellas_usadas_para_regresión where Informe_Fotometria_Identificador = ?', [selectedId]);
        const [meteor] = await pool.query('SELECT * FROM Datos_meteoro_fotometria WHERE Informe_Fotometria_Identificador = ?', [selectedId]);
        const [adjustPoint] = await pool.query('SELECT * FROM Puntos_del_ajuste WHERE Informe_Fotometria_Identificador = ?', [selectedId]);
            
        const response = {
            photometry: photometryArray[0],
            regressionStart: regressionStart,
            meteor: meteor[0],
            adjustPoint: adjustPoint
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function getDetectionFolder(date, time) {
    const rawDate = date instanceof Date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date)
        : String(date || '');
    const dateMatch = rawDate.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    const timeMatch = String(time || '').match(/(\d{2}):?(\d{2}):?(\d{2})/);
    const fullPath = process.env.FULL_PATH;

    if (!dateMatch || !timeMatch || !fullPath) {
        return null;
    }

    const [, year, month, day] = dateMatch;
    const [, hour, minute, second] = timeMatch;
    const normalizedFullPath = path.resolve(fullPath);
    const deteccionesSuffix = path.join('home', 'sma', 'Meteoros', 'Detecciones');
    const deteccionesRoot = normalizedFullPath.endsWith(deteccionesSuffix)
        ? normalizedFullPath
        : path.resolve(normalizedFullPath, deteccionesSuffix);

    return path.resolve(deteccionesRoot, year, `${year}${month}${day}`, `${hour}${minute}${second}`);
}

const getPhotometryGraph = async (req, res) => {
    try {
        const { selectedId } = req.params;
        const [photometryRows] = await pool.query(
            'SELECT Fecha, Hora FROM Informe_Fotometria WHERE Identificador = ? LIMIT 1',
            [selectedId]
        );
        const photometry = photometryRows[0];
        const detectionFolder = getDetectionFolder(photometry?.Fecha, photometry?.Hora);

        if (!detectionFolder) {
            return res.status(404).json({ error: 'No se pudo localizar el directorio de fotometría' });
        }

        const photometryFolder = path.resolve(detectionFolder, 'Fotometria');
        const files = await fs.promises.readdir(photometryFolder);
        const graphName = files.find(file => /\.jpe?g$/i.test(file));

        if (!graphName) {
            return res.status(404).json({ error: 'No hay gráfico JPG de fotometría' });
        }

        const graphPath = path.resolve(photometryFolder, graphName);
        if (!graphPath.startsWith(`${photometryFolder}${path.sep}`)) {
            return res.status(400).json({ error: 'Ruta de gráfico inválida' });
        }

        return res.sendFile(graphPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'No hay gráfico JPG de fotometría' });
        }

        return res.status(500).json({ error: error.message });
    }
}

module.exports = { getPhotometryFromId, getPhotometryGraph };
