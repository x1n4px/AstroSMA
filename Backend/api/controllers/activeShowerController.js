const pool = require('../database/connection');
require('dotenv').config();

const getAllShower = async (req, res) => {
    try {

        const [shower] = await pool.query('SELECT DISTINCT * FROM Lluvia l GROUP BY Identificador');
        const [IAUShower] = await pool.query('SELECT * FROM meteor_showers')

        res.json({ shower, IAUShower });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getNextShower = async (req, res) => {
    try {
        const [shower] = await pool.query(`SELECT * FROM Lluvia l INNER JOIN ( SELECT Identificador, MAX(Año) AS AñoMax FROM Lluvia GROUP BY Identificador) latest ON l.Identificador = latest.Identificador AND l.Año = latest.AñoMax WHERE (DATE_FORMAT(CURDATE(), '%m-%d') BETWEEN DATE_FORMAT(l.Fecha_Inicio, '%m-%d') AND DATE_FORMAT(l.Fecha_Fin, '%m-%d')) ORDER BY l.Año DESC;`);
        res.json({ shower });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



const getRainById = async (req, res) => {
    try {
        const { year } = req.params;
        console.log(year);
        const [rain] = await pool.query('SELECT * FROM Lluvia WHERE Año = ?', [year]);
        if (rain.length === 0) {
            return res.status(404).json({ message: 'Rain not found' });
        }
        res.json({rain});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRain = async (req, res) => {
    try {
        const { Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad } = req.body;
        console.log(Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad);
        await pool.query('INSERT INTO Lluvia (Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad) VALUES (?, ?, ?, ?, ?, ?)', [Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad]);
        const [existingRain] = await pool.query('SELECT * FROM Lluvia WHERE Identificador = ? AND Año = ?', [Identificador, Año]);
        res.status(201).json({ existingRain });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRain = async (req, res) => {
    try {
        const { id, year } = req.params;
        const { Identificador, Año, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad} = req.body;
        const [result] = await pool.query('UPDATE Lluvia SET Nombre=?, Fecha_Inicio=?, Fecha_Fin=?, Velocidad=? WHERE Identificador = ?', [Nombre, Fecha_Inicio, Fecha_Fin, Velocidad, id]);
        res.json({ message: 'Rain updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteRain = async (req, res) => {
    try {
        const { id, year } = req.params;
        console.log(id,year);
        await pool.query('DELETE FROM Lluvia WHERE Identificador = ? AND Año = ?', [id, year]);
        
        res.json({ message: 'Rain deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const duplicateRain = async (req, res) => {
    try {
        const { year } = req.params;

        // Obtener la lluvia más reciente por nombre
        const [rains] = await pool.query(`
            SELECT * FROM Lluvia l 
            WHERE Año = (
                SELECT MAX(l2.Año) 
                FROM Lluvia l2 
                WHERE l2.Identificador = l.Identificador
            );
        `);

        const duplicatedRains = rains.map(rain => {
            const fechaInicio = new Date(rain.Fecha_Inicio);
            const fechaFin = new Date(rain.Fecha_Fin);

            // Cambiar el año
            fechaInicio.setFullYear(year);
            fechaFin.setFullYear(year);

            return {
                ...rain,
                Año: parseInt(year),
                Fecha_Inicio: fechaInicio,
                Fecha_Fin: fechaFin
            };
        });

        for (const rain of duplicatedRains) {
            await pool.query(
                'INSERT INTO Lluvia (Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad) VALUES (?, ?, ?, ?, ?, ?)',
                [rain.Identificador, rain.Año, rain.Fecha_Inicio, rain.Fecha_Fin, rain.Nombre, rain.Velocidad]
            );
        }

        res.json({ message: 'Rains duplicated successfully', duplicatedRains });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllShower, getNextShower, duplicateRain, getRainById, createRain, updateRain, deleteRain };