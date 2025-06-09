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

        // 1. Obtener todas las lluvias del año
        const [rains] = await pool.query('SELECT * FROM Lluvia WHERE Año = ?', [year]);

        if (rains.length === 0) {
            return res.status(404).json({ message: 'Rain not found' });
        }

        // 2. Obtener los radiantes asociados a esas lluvias
        // Extraer pares Identificador + Año
        const identifiers = rains.map(r => r.Identificador);

        // Consulta para obtener todos los radiantes de lluvias de ese año y esos identificadores
        // Usamos IN para Identificador, y año fijo, ya que todos tienen el mismo año
        const [radiants] = await pool.query(
            `SELECT * FROM Radiant WHERE Año = ? AND Identificador IN (?)`,
            [year, identifiers]
        );

        // 3. Agrupar radiantes por Identificador para luego añadirlos a cada lluvia
        const radiantsById = {};
        for (const rad of radiants) {
            if (!radiantsById[rad.Identificador]) {
                radiantsById[rad.Identificador] = [];
            }
            radiantsById[rad.Identificador].push({
                id: rad.id,
                alpha: rad.alpha,
                delta: rad.delta,
                date: rad.date
            });
        }

        // 4. Añadir el array radiants a cada lluvia
        const rainsWithRadiants = rains.map(r => ({
            ...r,
            radiants: radiantsById[r.Identificador] || []
        }));

        res.json({ rains: rainsWithRadiants });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const createRain = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad, radiants } = req.body;

        await connection.beginTransaction();

        // Insertar la lluvia
        await connection.query(
            'INSERT INTO Lluvia (Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad) VALUES (?, ?, ?, ?, ?, ?)',
            [Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad]
        );

        // Insertar los radiants si vienen
        if (Array.isArray(radiants)) {
            for (const radiant of radiants) {
                await connection.query(
                    'INSERT INTO Radiants (alpha, delta, date, Identificador, Año) VALUES (?, ?, ?, ?, ?)',
                    [radiant.alpha, radiant.delta, radiant.date, Identificador, Año]
                );
            }
        }

        await connection.commit();

        // Obtener la lluvia creada para devolverla
        const [existingRain] = await connection.query('SELECT * FROM Lluvia WHERE Identificador = ? AND Año = ?', [Identificador, Año]);

        res.status(201).json({ existingRain });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};


const updateRain = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { Identificador, Año, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad, radiants } = req.body;
        console.log(req.body)
        await connection.beginTransaction();

        // Actualizar la lluvia
        await connection.query(
            'UPDATE Lluvia SET Nombre=?, Fecha_Inicio=?, Fecha_Fin=?, Velocidad=? WHERE Identificador = ? AND Año = ?',
            [Nombre, Fecha_Inicio, Fecha_Fin, Velocidad, Identificador, Año]
        );


        console.log(radiants);
        // Recorrer los radiants y actualizar o insertar
        for (const radiant of radiants) {
            if (radiant.deleted) {
                console.log('Eliminando radiant');
                await connection.query('DELETE FROM Radiant WHERE id = ?', [radiant.id]);

            } else if (radiant.id) {
                // Actualizar radiant existente
                await connection.query(
                    'UPDATE Radiant SET alpha=?, delta=?, date=? WHERE id = ?',
                    [radiant.alpha, radiant.delta, new Date(radiant.date), radiant.id]
                );
            } else {
                // Insertar nuevo radiant asociado a la lluvia
                await connection.query(
                    'INSERT INTO Radiant (alpha, delta, date, Identificador, Año) VALUES (?, ?, ?, ?, ?)',
                    [radiant.alpha, radiant.delta, new Date(radiant.date), Identificador, Año]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Rain and radiants updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};


const deleteRain = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id, year } = req.params;

        await connection.beginTransaction();

        // Borrar radiants relacionados
        await connection.query('DELETE FROM Radiant WHERE Identificador = ? AND Año = ?', [id, year]);

        // Borrar la lluvia
        await connection.query('DELETE FROM Lluvia WHERE Identificador = ? AND Año = ?', [id, year]);

        await connection.commit();

        res.json({ message: 'Rain and related radiants deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

const duplicateRain = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { year } = req.params;

        await connection.beginTransaction();

        // Obtener la lluvia más reciente por identificador
        const [rains] = await connection.query(`
            SELECT * FROM Lluvia l 
            WHERE Año = (
                SELECT MAX(l2.Año) 
                FROM Lluvia l2 
                WHERE l2.Identificador = l.Identificador
            );
        `);

        const duplicatedRains = [];

        for (const rain of rains) {
            const fechaInicio = new Date(rain.Fecha_Inicio);
            const fechaFin = new Date(rain.Fecha_Fin);

            fechaInicio.setFullYear(year);
            fechaFin.setFullYear(year);

            // Insertar la lluvia duplicada con el nuevo año
            await connection.query(
                'INSERT INTO Lluvia (Identificador, Año, Fecha_Inicio, Fecha_Fin, Nombre, Velocidad) VALUES (?, ?, ?, ?, ?, ?)',
                [rain.Identificador, year, fechaInicio, fechaFin, rain.Nombre, rain.Velocidad]
            );

            // Obtener radiants relacionados con la lluvia original
            const [radiants] = await connection.query(
                'SELECT alpha, delta, date FROM Radiant WHERE Identificador = ? AND Año = ?',
                [rain.Identificador, rain.Año]
            );

            // Insertar radiants duplicados con la nueva lluvia_id (mismo Identificador)
            for (const radiant of radiants) {
                await connection.query(
                    'INSERT INTO Radiant (alpha, delta, date, Identificador, Año) VALUES (?, ?, ?, ?, ?)',
                    [radiant.alpha, radiant.delta, radiant.date, rain.Identificador, year]
                );
            }

            duplicatedRains.push({
                ...rain,
                Año: year,
                Fecha_Inicio: fechaInicio,
                Fecha_Fin: fechaFin
            });
        }

        await connection.commit();

        res.json({ message: 'Rains duplicated successfully', duplicatedRains });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

function formatTwoDigits(number) {
    return number.toString().padStart(2, '0');
}

function generateMeteorShowerTxt(data) {
    const sectionA = [];
    const sectionB = [];

    // Esta estructura guarda los placeholders de las líneas tipo A y los datos relacionados
    const aLinesWithMeta = [];

    // Primero: generar las líneas A con placeholder, y construir líneas B
    data.forEach((shower, index) => {
        const startDate = new Date(shower.Fecha_Inicio);
        const endDate = new Date(shower.Fecha_Fin);

        const startMonth = formatTwoDigits(startDate.getUTCMonth() + 1);
        const startDay = formatTwoDigits(startDate.getUTCDate());
        const endMonth = formatTwoDigits(endDate.getUTCMonth() + 1);
        const endDay = formatTwoDigits(endDate.getUTCDate());

        // Placeholder temporal para NUM_LINEA
        const placeholder = `__LINE_${index}__`;

        const lineA = `*:${startMonth}:${startDay}:${endMonth}:${endDay}:${shower.Identificador}:${shower.Nombre}:${placeholder}:${shower.Velocidad}`;
        sectionA.push(lineA);

        // Crear bloque B correspondiente
        const bLines = [shower.Identificador];

        if (Array.isArray(shower.radiants)) {
            shower.radiants.forEach(radiant => {
                if (radiant && radiant.date && radiant.alpha != null && radiant.delta != null) {
                    const radiantDate = new Date(radiant.date);
                    const month = formatTwoDigits(radiantDate.getUTCMonth() + 1);
                    const day = formatTwoDigits(radiantDate.getUTCDate());
                    bLines.push(`${month}:${day}:${radiant.alpha}:${radiant.delta}`);
                }
            });
        }

        // Guardar metadatos para actualizar más tarde
        aLinesWithMeta.push({ placeholder, bLineIndex: sectionB.length + 1 }); // +1 por encabezados tipo A
        sectionB.push(...bLines);
    });

    // Segunda pasada: reemplazar placeholders con línea real (posición de la línea del identificador)
    const totalLinesInA = sectionA.length;
    const updatedSectionA = sectionA.map(line => {
        for (const { placeholder, bLineIndex } of aLinesWithMeta) {
            const lineIndexInFullOutput = totalLinesInA + bLineIndex; // Línea real donde empieza IDENTIFICADOR
            if (line.includes(placeholder)) {
                return line.replace(placeholder, lineIndexInFullOutput.toString());
            }
        }
        return line; // No hay placeholder (raro)
    });

    return [...updatedSectionA, ...sectionB].join('\n');
}





const txt = async (req, res) => {
    try {
        const { year } = req.params;
        // 1. Obtener todas las lluvias del año
        const [rains] = await pool.query('SELECT * FROM Lluvia WHERE Año = ?', [year]);
        if (rains.length === 0) {
            return res.status(404).json({ message: 'Rain not found' });
        }

        // 2. Obtener los radiantes asociados a esas lluvias
        // Extraer pares Identificador + Año
        const identifiers = rains.map(r => r.Identificador);

        // Consulta para obtener todos los radiantes de lluvias de ese año y esos identificadores
        // Usamos IN para Identificador, y año fijo, ya que todos tienen el mismo año
        const [radiants] = await pool.query(
            `SELECT * FROM Radiant WHERE Año = ? AND Identificador IN (?)`,
            [year, identifiers]
        );

        // 3. Agrupar radiantes por Identificador para luego añadirlos a cada lluvia
        const radiantsById = {};
        for (const rad of radiants) {
            if (!radiantsById[rad.Identificador]) {
                radiantsById[rad.Identificador] = [];
            }
            radiantsById[rad.Identificador].push({
                id: rad.id,
                alpha: rad.alpha,
                delta: rad.delta,
                date: rad.date
            });
        }

        // 4. Añadir el array radiants a cada lluvia
        const rainsWithRadiants = rains.map(r => ({
            ...r,
            radiants: radiantsById[r.Identificador] || []
        }));


        const txtContent = generateMeteorShowerTxt(rainsWithRadiants);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename="meteor-showers.txt"');
        res.send(txtContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { txt, getAllShower, getNextShower, duplicateRain, getRainById, createRain, updateRain, deleteRain };