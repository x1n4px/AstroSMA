const pool = require('../database/connection');

const SCIENTIFIC_TABLES = {
    'radiant-reports': {
        label: 'Informes radiantes',
        table: 'Informe_Radiante',
        primaryKeys: ['Identificador'],
        dateColumn: 'Fecha',
        meteorColumn: 'Meteoro_Identificador',
        stationColumns: ['Observatorio_Número'],
        columns: [
            'Identificador',
            'Fecha',
            'Hora',
            'Velocidad_Lluvia_Asociada',
            'Trayectorias_estimadas_para',
            'Distancia_angular_radianes',
            'Distancia_angular_grados',
            'Velocidad_angular_grad_sec',
            'Meteoro_Identificador',
            'Observatorio_Número',
            'Lluvia_Asociada'
        ],
        integerColumns: ['Identificador', 'Velocidad_Lluvia_Asociada', 'Meteoro_Identificador', 'Observatorio_Número'],
        numberColumns: ['Distancia_angular_radianes', 'Distancia_angular_grados', 'Velocidad_angular_grad_sec'],
        orderBy: ['Fecha DESC', 'Hora DESC', 'Identificador DESC']
    },
    'photometry-reports': {
        label: 'Informes de fotometría',
        table: 'Informe_Fotometria',
        primaryKeys: ['Identificador'],
        dateColumn: 'Fecha',
        meteorColumn: 'Meteoro_Identificador',
        columns: [
            'Identificador',
            'Fecha',
            'Hora',
            'Estrellas_visibles',
            'Estrellas_usadas_para_regresion',
            'Coeficiente_externo_Recta_de_Bouger',
            'Punto_cero_Recta_de_Bouger',
            'Error_tipico_regresion',
            'Error_tipico_punto_cero',
            'Error_tipico_coeficiente_externo',
            'Coeficientes_parabola_trayectoria',
            'MagMax',
            'MagMin',
            'Masa_fotometrica',
            'Meteoro_Identificador'
        ],
        integerColumns: ['Identificador', 'Estrellas_visibles', 'Estrellas_usadas_para_regresion', 'Meteoro_Identificador'],
        numberColumns: [
            'Coeficiente_externo_Recta_de_Bouger',
            'Punto_cero_Recta_de_Bouger',
            'Error_tipico_regresion',
            'Error_tipico_punto_cero',
            'Error_tipico_coeficiente_externo',
            'MagMax',
            'MagMin',
            'Masa_fotometrica'
        ],
        orderBy: ['Fecha DESC', 'Hora DESC', 'Identificador DESC']
    },
    'parametric-equations': {
        label: 'Ecuaciones paramétricas',
        table: 'Ecuacion_parametrica',
        primaryKeys: ['IdEc'],
        columns: ['IdEc', 'a', 'b', 'c', 'Inicio_Estacion_1', 'Fin_Estacion_1', 'Inicio_Estacion_2', 'Fin_Estacion_2'],
        integerColumns: ['IdEc'],
        numberColumns: ['a', 'b', 'c'],
        orderBy: ['IdEc DESC']
    },
    'orbital-elements': {
        label: 'Elementos orbitales',
        table: 'Elementos_Orbitales',
        primaryKeys: ['Informe_Z_IdInforme', 'Calculados_con'],
        relatedColumn: 'Informe_Z_IdInforme',
        relatedLabel: 'ID informe Z',
        columns: ['Informe_Z_IdInforme', 'Calculados_con', 'Vel__Inf', 'Vel__Geo', 'Ar', 'De', 'i', 'p', 'a', 'e', 'q', 'T', 'omega', 'Omega_grados_votos_max_min'],
        integerColumns: ['Informe_Z_IdInforme'],
        orderBy: ['Informe_Z_IdInforme DESC', 'Calculados_con ASC']
    },
    'zwo-points': {
        label: 'Puntos ZWO',
        table: 'Puntos_ZWO',
        primaryKeys: ['X', 'Y', 'Informe_Z_IdInforme'],
        relatedColumn: 'Informe_Z_IdInforme',
        relatedLabel: 'ID informe Z',
        dateColumn: 'Fecha',
        columns: ['Fecha', 'Hora', 'X', 'Y', 'Ar_Grados', 'De_Grados', 'Ar_Sexagesimal', 'De_Sexagesimal', 'Informe_Z_IdInforme'],
        integerColumns: ['Informe_Z_IdInforme'],
        numberColumns: ['X', 'Y', 'Ar_Grados', 'De_Grados'],
        orderBy: ['Informe_Z_IdInforme DESC', 'Fecha DESC', 'Hora DESC']
    },
    'measured-trajectories': {
        label: 'Trayectorias medidas Z',
        table: 'Trayectoria_medida',
        primaryKeys: ['Hora', 'Informe_Z_IdInforme'],
        relatedColumn: 'Informe_Z_IdInforme',
        relatedLabel: 'ID informe Z',
        dateColumn: 'Fecha',
        columns: ['Fecha', 'Hora', 's', 't', 'v', 'lambda', 'phi', 'AR_Estacion_1', 'De_Estacion_1', 'Ar_Estacion_2', 'De_Estacion_2', 'X', 'Y', 'Pix', 'Pix_Seg', 'Informe_Z_IdInforme'],
        integerColumns: ['Informe_Z_IdInforme'],
        numberColumns: ['s', 't', 'v', 'X', 'Y', 'Pix', 'Pix_Seg'],
        orderBy: ['Informe_Z_IdInforme DESC', 'Fecha DESC', 'Hora DESC']
    },
    'regression-trajectories': {
        label: 'Trayectorias por regresión Z',
        table: 'Trayectoria_por_regresion',
        primaryKeys: ['t', 'Informe_Z_IdInforme'],
        relatedColumn: 'Informe_Z_IdInforme',
        relatedLabel: 'ID informe Z',
        dateColumn: 'Fecha',
        columns: ['Fecha', 'Hora', 't', 's', 'v_Kms', 'v_Pixs', 'Informe_Z_IdInforme'],
        integerColumns: ['Informe_Z_IdInforme'],
        numberColumns: ['t', 's', 'v_Kms', 'v_Pixs'],
        orderBy: ['Informe_Z_IdInforme DESC', 'Fecha DESC', 'Hora DESC']
    },
    'photometry-meteor-data': {
        label: 'Datos de meteoro en fotometría',
        table: 'Datos_meteoro_fotometria',
        primaryKeys: ['Informe_Fotometria_Identificador'],
        relatedColumn: 'Informe_Fotometria_Identificador',
        relatedLabel: 'ID informe de fotometría',
        columns: ['X_Inicio', 'Y_Inicio', 'Maire_Inicio', 'distInicio', 'X_Final', 'Y_Final', 'Maire_Final', 'dist_Final', 'Informe_Fotometria_Identificador'],
        integerColumns: ['Informe_Fotometria_Identificador'],
        numberColumns: ['X_Inicio', 'Y_Inicio', 'Maire_Inicio', 'distInicio', 'X_Final', 'Y_Final', 'Maire_Final', 'dist_Final'],
        orderBy: ['Informe_Fotometria_Identificador DESC']
    },
    'photometry-stars': {
        label: 'Estrellas usadas en fotometría',
        table: 'Estrellas_usadas_para_regresión',
        primaryKeys: ['Identificador'],
        relatedColumn: 'Informe_Fotometria_Identificador',
        relatedLabel: 'ID informe de fotometría',
        columns: ['Identificador', 'Id_estrella', 'Masa_de_aire', 'Magnitud_de_catalogo', 'Magnitud_instrumental', 'Informe_Fotometria_Identificador'],
        integerColumns: ['Identificador', 'Informe_Fotometria_Identificador'],
        numberColumns: ['Masa_de_aire', 'Magnitud_de_catalogo', 'Magnitud_instrumental'],
        orderBy: ['Informe_Fotometria_Identificador DESC', 'Identificador DESC']
    },
    'photometry-adjustment-points': {
        label: 'Puntos del ajuste de fotometría',
        table: 'Puntos_del_ajuste',
        primaryKeys: ['t', 'Informe_Fotometria_Identificador'],
        relatedColumn: 'Informe_Fotometria_Identificador',
        relatedLabel: 'ID informe de fotometría',
        columns: ['t', 'Dist', 'Mc', 'Ma', 'Informe_Fotometria_Identificador'],
        integerColumns: ['Informe_Fotometria_Identificador'],
        numberColumns: ['t', 'Dist', 'Mc', 'Ma'],
        orderBy: ['Informe_Fotometria_Identificador DESC', 't ASC']
    },
    'radiant-estimated-trajectories': {
        label: 'Trayectorias estimadas radiantes',
        table: 'Trayectoria_estimada',
        primaryKeys: ['Lon_Inicio', 'Informe_Radiante_Identificador'],
        relatedColumn: 'Informe_Radiante_Identificador',
        relatedLabel: 'ID informe radiante',
        columns: ['Velocidad', 'Lon_Inicio', 'Lat_Inicio', 'Alt_Inicio', 'Dist_Inicio', 'Lon_Final', 'Lat_Final', 'Alt_Final', 'Dist_Final', 'Recor', 'e', 't', 'Informe_Radiante_Identificador'],
        integerColumns: ['Informe_Radiante_Identificador'],
        numberColumns: ['Velocidad', 'Alt_Inicio', 'Dist_Inicio', 'Alt_Final', 'Dist_Final', 'Recor', 'e', 't'],
        orderBy: ['Informe_Radiante_Identificador DESC', 'Lon_Inicio ASC']
    },
    'angular-velocities': {
        label: 'Velocidades angulares radiantes',
        table: 'Velociades_Angulares',
        primaryKeys: ['hi', 'Informe_Radiante_Identificador'],
        relatedColumn: 'Informe_Radiante_Identificador',
        relatedLabel: 'ID informe radiante',
        columns: ['hi', 'Lluvia', 'Meteoro', 'Informe_Radiante_Identificador'],
        integerColumns: ['Informe_Radiante_Identificador'],
        numberColumns: ['hi', 'Lluvia', 'Meteoro'],
        orderBy: ['Informe_Radiante_Identificador DESC', 'hi ASC']
    },
    'active-showers-z': {
        label: 'Lluvias activas de informes Z',
        table: 'Lluvia_activa',
        primaryKeys: ['Lluvia_Identificador', 'Informe_Z_IdInforme'],
        relatedColumn: 'Informe_Z_IdInforme',
        relatedLabel: 'ID informe Z',
        columns: ['Distancia_mínima_entre_radianes_y_trayectoria', 'Lluvia_Identificador', 'Lluvia_Año', 'Informe_Z_IdInforme'],
        integerColumns: ['Lluvia_Año', 'Informe_Z_IdInforme'],
        orderBy: ['Informe_Z_IdInforme DESC', 'Lluvia_Identificador ASC']
    },
    'active-showers-radiant': {
        label: 'Lluvias activas de informes radiantes',
        table: 'Lluvia_Activa_InfRad',
        primaryKeys: ['Informe_Radiante_Identificador', 'Lluvia_Identificador', 'Lluvia_Año'],
        relatedColumn: 'Informe_Radiante_Identificador',
        relatedLabel: 'ID informe radiante',
        columns: ['Ar_de_la_fecha', 'De_de_la_fecha', 'Ar_más_cercano', 'De_más_cercano', 'Distancia', 'Informe_Radiante_Identificador', 'Lluvia_Identificador', 'Lluvia_Año'],
        integerColumns: ['Informe_Radiante_Identificador', 'Lluvia_Año'],
        numberColumns: ['Ar_de_la_fecha', 'De_de_la_fecha', 'Ar_más_cercano', 'De_más_cercano', 'Distancia'],
        orderBy: ['Informe_Radiante_Identificador DESC', 'Lluvia_Identificador ASC']
    },
    'shower-sections': {
        label: 'Secciones de lluvias',
        table: 'Seccion',
        primaryKeys: ['Fecha', 'Lluvia_Identificador', 'Lluvia_Año'],
        dateColumn: 'Fecha',
        columns: ['Fecha', 'Identificador', 'Ascensión_recta_del_radiante', 'Declinación_del_radiante', 'Lluvia_Identificador', 'Lluvia_Año'],
        integerColumns: ['Identificador', 'Ascensión_recta_del_radiante', 'Declinación_del_radiante', 'Lluvia_Año'],
        orderBy: ['Fecha DESC', 'Lluvia_Año DESC', 'Lluvia_Identificador ASC']
    },
    'meteor-showers-catalog': {
        label: 'Catálogo meteor showers',
        table: 'meteor_showers',
        primaryKeys: ['LP'],
        columns: [
            'LP', 'IAUNo', 'AdNo', 'Code', 'Status', 'SubDate', 'ShowerNameDesignation', 'Activity',
            'LoSb', 'LoSe', 'LoS', 'Ra', 'De', 'dRa', 'dDe', 'Vg', 'LoR', 'S_LoR', 'LaR',
            'Theta', 'Phi', 'Flags', 'A', 'Q', 'E', 'Peri', 'Node', 'Incl', 'N', 'GroupIAU',
            'CG', 'Origin', 'Remarks', 'OTe', 'LookupTable', 'ReferencesInfo'
        ],
        integerColumns: ['LP', 'Status', 'N', 'GroupIAU', 'CG'],
        numberColumns: ['LoSb', 'LoSe', 'LoS', 'Ra', 'De', 'dRa', 'dDe', 'Vg', 'LoR', 'S_LoR', 'LaR', 'Theta', 'Phi', 'A', 'Q', 'E', 'Peri', 'Node', 'Incl'],
        orderBy: ['LP DESC']
    }
};

const quoteIdentifier = (identifier) => `\`${identifier.replace(/`/g, '``')}\``;
const quoteColumns = (columns) => columns.map(quoteIdentifier).join(', ');
const nullableValue = (value) => value === undefined || value === null || value === '' ? null : value;

function getTableConfig(req, res) {
    const config = SCIENTIFIC_TABLES[req.params.tableKey];

    if (!config) {
        res.status(404).json({ message: 'Tabla científica no disponible para edición' });
        return null;
    }

    return config;
}

function normalizeRow(config, payload = {}) {
    const integerColumns = new Set(config.integerColumns || []);
    const numberColumns = new Set([...(config.numberColumns || []), ...(config.integerColumns || [])]);

    return config.columns.reduce((row, column) => {
        const value = nullableValue(payload[column]);
        if (value === null || !numberColumns.has(column)) {
            row[column] = value;
            return row;
        }

        const parsed = Number(value);
        row[column] = Number.isNaN(parsed) ? null : parsed;
        if (integerColumns.has(column) && !Number.isInteger(row[column])) {
            row[column] = Number.NaN;
        }
        return row;
    }, {});
}

function validateRow(config, row) {
    for (const primaryKey of config.primaryKeys) {
        if (row[primaryKey] === null || row[primaryKey] === undefined || Number.isNaN(row[primaryKey])) {
            return `${primaryKey} es obligatorio`;
        }
    }

    for (const integerColumn of config.integerColumns || []) {
        if (Number.isNaN(row[integerColumn])) {
            return `${integerColumn} debe ser un entero`;
        }
    }

    return null;
}

function buildPrimaryKeyWhere(config, source) {
    const keyValues = source || {};
    const values = [];
    const conditions = [];

    for (const primaryKey of config.primaryKeys) {
        const value = nullableValue(keyValues[primaryKey]);
        if (value === null) {
            return null;
        }

        conditions.push(`${quoteIdentifier(primaryKey)} = ?`);
        values.push(value);
    }

    return { sql: conditions.join(' AND '), values };
}

function serializeConfig(config) {
    return {
        key: Object.keys(SCIENTIFIC_TABLES).find(key => SCIENTIFIC_TABLES[key] === config),
        label: config.label,
        columns: config.columns,
        primaryKeys: config.primaryKeys,
        numberColumns: [...(config.numberColumns || []), ...(config.integerColumns || [])],
        dateColumns: config.dateColumn ? [config.dateColumn] : [],
        relatedColumn: config.relatedColumn || null,
        relatedLabel: config.relatedLabel || null
    };
}

async function getScientificRows(req, res) {
    const config = getTableConfig(req, res);
    if (!config) return;

    try {
        const params = [];
        const whereClauses = ['1=1'];
        const meteorId = Number(req.query.meteorId);
        const stationId = Number(req.query.stationId);

        if (config.meteorColumn && Number.isInteger(meteorId) && meteorId > 0) {
            whereClauses.push(`${quoteIdentifier(config.meteorColumn)} = ?`);
            params.push(meteorId);
        }
        if (config.stationColumns?.length && Number.isInteger(stationId) && stationId > 0) {
            whereClauses.push(`(${config.stationColumns.map(column => `${quoteIdentifier(column)} = ?`).join(' OR ')})`);
            params.push(...config.stationColumns.map(() => stationId));
        }
        if (config.dateColumn && req.query.startDate) {
            whereClauses.push(`${quoteIdentifier(config.dateColumn)} >= ?`);
            params.push(req.query.startDate);
        }
        if (config.dateColumn && req.query.endDate) {
            whereClauses.push(`${quoteIdentifier(config.dateColumn)} <= ?`);
            params.push(req.query.endDate);
        }
        if (config.relatedColumn && req.query.relatedId) {
            whereClauses.push(`${quoteIdentifier(config.relatedColumn)} = ?`);
            params.push(req.query.relatedId);
        }

        const orderBy = (config.orderBy || config.primaryKeys.map(key => `${quoteIdentifier(key)} DESC`)).join(', ');
        const [rows] = await pool.query(
            `SELECT ${quoteColumns(config.columns)} FROM ${quoteIdentifier(config.table)} WHERE ${whereClauses.join(' AND ')} ORDER BY ${orderBy} LIMIT 250`,
            params
        );

        return res.json({ config: serializeConfig(config), rows });
    } catch (error) {
        console.error(`Error loading ${config.table}:`, error);
        return res.status(500).json({ message: `No se pudo cargar ${config.label.toLowerCase()}` });
    }
}

async function getScientificRow(config, key) {
    const where = buildPrimaryKeyWhere(config, key);
    if (!where) return null;

    const [rows] = await pool.query(
        `SELECT ${quoteColumns(config.columns)} FROM ${quoteIdentifier(config.table)} WHERE ${where.sql} LIMIT 1`,
        where.values
    );
    return rows[0] || null;
}

async function createScientificRow(req, res) {
    const config = getTableConfig(req, res);
    if (!config) return;

    const row = normalizeRow(config, req.body);
    const validationError = validateRow(config, row);
    if (validationError) return res.status(400).json({ message: validationError });

    try {
        await pool.query(
            `INSERT INTO ${quoteIdentifier(config.table)} (${quoteColumns(config.columns)}) VALUES (${config.columns.map(() => '?').join(', ')})`,
            config.columns.map(column => row[column])
        );
        return res.status(201).json(await getScientificRow(config, row));
    } catch (error) {
        console.error(`Error creating ${config.table}:`, error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe un registro con esa clave' });
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') return res.status(409).json({ message: 'El registro relacionado no existe' });
        return res.status(500).json({ message: `No se pudo crear ${config.label.toLowerCase()}` });
    }
}

async function updateScientificRow(req, res) {
    const config = getTableConfig(req, res);
    if (!config) return;

    const originalKey = req.body?.key;
    const row = normalizeRow(config, req.body?.row);
    const where = buildPrimaryKeyWhere(config, originalKey);
    const validationError = validateRow(config, row);
    if (!where) return res.status(400).json({ message: 'Clave del registro inválida' });
    if (validationError) return res.status(400).json({ message: validationError });

    try {
        const editableColumns = config.columns.filter(column => !config.primaryKeys.includes(column));
        const [result] = await pool.query(
            `UPDATE ${quoteIdentifier(config.table)} SET ${editableColumns.map(column => `${quoteIdentifier(column)} = ?`).join(', ')} WHERE ${where.sql}`,
            [...editableColumns.map(column => row[column]), ...where.values]
        );
        if (!result.affectedRows) return res.status(404).json({ message: 'Registro no encontrado' });
        return res.json(await getScientificRow(config, originalKey));
    } catch (error) {
        console.error(`Error updating ${config.table}:`, error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') return res.status(409).json({ message: 'El registro relacionado no existe' });
        return res.status(500).json({ message: `No se pudo actualizar ${config.label.toLowerCase()}` });
    }
}

async function deleteScientificRow(req, res) {
    const config = getTableConfig(req, res);
    if (!config) return;

    const where = buildPrimaryKeyWhere(config, req.body?.key);
    if (!where) return res.status(400).json({ message: 'Clave del registro inválida' });

    try {
        const [result] = await pool.query(
            `DELETE FROM ${quoteIdentifier(config.table)} WHERE ${where.sql}`,
            where.values
        );
        if (!result.affectedRows) return res.status(404).json({ message: 'Registro no encontrado' });
        return res.json({ message: 'Registro eliminado' });
    } catch (error) {
        console.error(`Error deleting ${config.table}:`, error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') return res.status(409).json({ message: 'El registro tiene datos asociados y no se puede eliminar' });
        return res.status(500).json({ message: `No se pudo eliminar ${config.label.toLowerCase()}` });
    }
}

module.exports = {
    getScientificRows,
    createScientificRow,
    updateScientificRow,
    deleteScientificRow
};
