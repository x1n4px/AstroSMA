const pool = require('../database/connection');
const { extraerUserId } = require('../middlewares/extractJWT')

const { transform, convertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');

const getRadiantReport = async (req, res) => {
    try {
        const token = req.header('x-token');
        const user_id = extraerUserId(token);
        const { id } = req.params;
        const [report] = await pool.query('SELECT ir.* FROM Informe_Radiante ir WHERE Identificador = ?', [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [trajectory] = await pool.query('SELECT * FROM Trayectoria_estimada WHERE Informe_Radiante_Identificador = ?', [id]);
        const [activeShower] = await pool.query('SELECT la.*, l.* FROM Lluvia_Activa_InfRad la JOIN Lluvia l ON l.Identificador = la.Lluvia_Identificador WHERE la.Informe_Radiante_Identificador = ? GROUP BY la.Lluvia_Identificador', [id]);
        const [angularVelocity] = await pool.query('SELECT * FROM Velociades_Angulares WHERE Informe_Radiante_Identificador = ?', [id]);

        const response = {
            report: report[0],
            observatory: obs1[0],
            trajectory: trajectory,
            activeShower: activeShower,
            angularVelocity: angularVelocity
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener el informe:', error);
        res.status(500).json({ error: error.message });
    }
};

const saveReportAdvice = async (req, res) => {
    try {
        const { formData } = req.body;
        const token = req.header('x-token');

        const user_id = extraerUserId(token);
        
        const { Description, Tab, Informe_Z_Id } = formData;
        const Id = parseInt(Informe_Z_Id);
    
        await pool.execute(`INSERT INTO Informe_Error (Informe_Z_Id, Tab, Description, user_Id) VALUES (${Id}, '${Tab.toString()}', '${Description.toString()}', ${user_id})`);
        res.json({ message: 'Informe de error guardado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// --------------------------------------------------- FUZZY LOGIC --------------------------------------------------- //

function membershipDMRT(DMRT) {
    const umbral = 5;
    const max = 10; // más permisivo que 30
    if (DMRT <= umbral) {
        return 1;
    } else if (DMRT >= max) {
        return 0;
    } else {
        return 1 - (DMRT - umbral) / (max - umbral);
    }
}




// Membership function for the eccentricity (e) of the bolide
function membershipEccentricity(bolideValue, showerValue) {
    const tolerancia = 0.2; // antes era 0.1 → lo abrimos
    const diferencia = Math.abs(bolideValue - showerValue);

    if (diferencia > tolerancia) {
        return 0;
    } else {
        return 1 - (diferencia / tolerancia);
    }
}


function membershipSemiMajorAxis(valorBólido, valorLluvia) {
    const tolerancia = 1; // en UA — mucho más flexible que 0.5
    const diferencia = Math.abs(valorBólido - valorLluvia);

    if (diferencia > tolerancia) {
        return 0;
    } else {
        return 1 - (diferencia / tolerancia);
    }
}


function membershipPerihelion(bolideValue, showerValue) {
    const tolerancia = 0.2; // más tolerante que 0.1
    const diferencia = Math.abs(bolideValue - showerValue);

    if (diferencia > tolerancia) {
        return 0;
    } else {
        return 1 - (diferencia / tolerancia);
    }
}


// Function to calculate the overall membership index between 1 and 9
function calculateMembership(bolide, shower) {
    console.log('Bolide:', bolide);
    console.log('Shower:', shower);
    const pertenenciaDMRTV = membershipDMRT(parseFloat(shower.Distancia_mínima_entre_radianes_y_trayectoria));
    if (pertenenciaDMRTV === 0) {
        return 0;
    }

    const membershipE = membershipEccentricity(parseFloat(bolide.e), parseFloat(shower.e));
    const membershipA = membershipSemiMajorAxis(parseFloat(bolide.a), parseFloat(shower.a));
    const membershipQ = membershipPerihelion(parseFloat(bolide.q), parseFloat(shower.q));


    const totalMembership =
        (pertenenciaDMRTV * 0.7) +
        (membershipE * 0.1) +
        (membershipA * 0.1) +
        (membershipQ * 0.1);


    // Escalar a valor entre 1 y 9
    const finalValue = Math.round(totalMembership * 8) + 1;
    return finalValue;
}


async function IMOShowers(id) {
    const [reports] = await pool.query(`
        SELECT iz.IdInforme, iz.Fecha 
        FROM Informe_Z iz 
        WHERE iz.IdInforme = ?
    `, [id]);

    const report = reports[0];
    if (!report) return [];

    const [orbital] = await pool.query(`
        SELECT 
            SUBSTRING_INDEX(eo.e, ' ', 1) AS e, 
            SUBSTRING_INDEX(eo.a, ' ', 1) AS a, 
            SUBSTRING_INDEX(eo.q, ' ', 1) AS q, 
            SUBSTRING_INDEX(eo.Ar, ' ', 1) AS Ar, 
            SUBSTRING_INDEX(eo.De, ' ', 1) AS De 
        FROM Elementos_Orbitales eo 
        WHERE eo.Informe_Z_IdInforme = ?;
    `, [report.IdInforme]);

    const [lluvias] = await pool.query(`
        SELECT la.* , l.*
        FROM Lluvia_activa la  
        LEFT JOIN Informe_Z iz ON iz.IdInforme = la.Informe_Z_IdInforme 
        LEFT JOIN Lluvia l ON l.Identificador = la.Lluvia_Identificador AND l.Año = la.Lluvia_Año 
        WHERE iz.IdInforme = ?;
    `, [report.IdInforme]);

    let lluvias_datos = [];

    for (const lluvia of lluvias) {
        const idLimpio = lluvia.Lluvia_Identificador.replace(/[^a-zA-Z]/g, '');

        const [lluviaData] = await pool.query(`
            SELECT 
                ms.Code, 
                AVG(Ra) AS Ar, 
                AVG(De) AS De, 
                AVG(E) AS e, 
                AVG(A) AS a, 
                AVG(Q) AS q
            FROM meteor_showers ms 
            WHERE ms.Code LIKE ?;
        `, [idLimpio]);

        const code = lluviaData[0]?.Code?.replace(/[^a-zA-Z]/g, '');

        if (code === idLimpio) {
            lluviaData[0].Distancia_mínima_entre_radianes_y_trayectoria = lluvia.Distancia_mínima_entre_radianes_y_trayectoria;

        }

        lluvias_datos.push({
            ...lluviaData[0],
            ...lluvia
        });
    }
    const result = [];

    for (const rs of lluvias_datos) {
        for (const ob of orbital) {
            const membership = calculateMembership(ob, rs);
            result.push({
                ...rs,
                membership
            });
        }
    }

    return result;
}


async function IAUShowers(id, date) {
    const [reports] = await pool.query(`
        SELECT iz.IdInforme, iz.Fecha 
        FROM Informe_Z iz 
        WHERE iz.IdInforme = ?
    `, [id]);
    const UMBRAL_GRADOS = 5; // Umbral de sensibilidad

    // Funciones auxiliares
    const toRadians = deg => deg * Math.PI / 180;
    const toDegrees = rad => rad * 180 / Math.PI;

    function cosDist(ar1, de1, ar2, de2) {
        const α1 = toRadians(ar1);
        const δ1 = toRadians(de1);
        const α2 = toRadians(ar2);
        const δ2 = toRadians(de2);

        return Math.sin(δ1) * Math.sin(δ2) +
            Math.cos(δ1) * Math.cos(δ2) * Math.cos(α1 - α2);
    }

    const calcularProbabilidad = (distanciaMediaDeg, umbral) => {
        if (distanciaMediaDeg <= umbral) {
            return 1; // Si está dentro del umbral, la probabilidad es 1 (100%)
        }
        // Probabilidad disminuye de forma exponencial más suavemente
        const decayFactor = Math.exp(-(distanciaMediaDeg - umbral) / umbral);
        return (decayFactor * 100).toFixed(2) + " %";
    };


    const report = reports[0];
    const [zwoData] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Puntos_ZWO.Informe_Z_IdInforme = ?', [report.IdInforme]);
    if (!report) return [];

    const [orbital] = await pool.query(`
        SELECT 
            SUBSTRING_INDEX(eo.e, ' ', 1) AS e, 
            SUBSTRING_INDEX(eo.a, ' ', 1) AS a, 
            SUBSTRING_INDEX(eo.q, ' ', 1) AS q, 
            SUBSTRING_INDEX(eo.Ar, ' ', 1) AS Ar, 
            SUBSTRING_INDEX(eo.De, ' ', 1) AS De 
        FROM Elementos_Orbitales eo 
        WHERE eo.Informe_Z_IdInforme = ?;
    `, [report.IdInforme]);

    const dateToIAU = new Date(report.Fecha);
    const day = dateToIAU.getDate();
    const month = dateToIAU.getMonth() + 1;
    const formatted = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}`;


    const [lluvias] = await pool.query(`
        SELECT ms.Code, ms.Activity, ms.SubDate, ms.Ra as Ra, ms.De, ms.E as e, ms.A as a, ms.Q as q
        FROM meteor_showers ms
        WHERE 
        ABS(DAYOFYEAR(ms.SubDate) - DAYOFYEAR(STR_TO_DATE(?, '%d-%m'))) <= 30
        AND ms.Code != ""
        AND ms.A != "" AND ms.Q != "" AND ms.E != "" AND ms.Ra != "" AND ms.De != "";
    `, [formatted]);

    let lluvias_datos = [];

    for (const lluvia of lluvias) {
        const cosValues = zwoData.map((punto) => {
            return cosDist(punto.Ar_Grados, punto.De_Grados, lluvia.Ra, lluvia.De);
        });

        const mediaCos = cosValues.reduce((a, b) => a + b, 0) / cosValues.length;

        // Clamp del valor entre -1 y 1 para evitar errores numéricos con acos
        const clamped = Math.min(Math.max(mediaCos, -1), 1);
        const distanciaMediaRad = Math.acos(clamped);
        const distanciaMediaDeg = toDegrees(distanciaMediaRad);

        lluvias_datos.push({
            ...lluvia,
            'Distancia_mínima_entre_radianes_y_trayectoria': distanciaMediaDeg.toFixed(2),
        });

    }
    const result = [];

    for (const rs of lluvias_datos) {
        for (const ob of orbital) {
            const membership = calculateMembership(ob, rs);
            if (membership > 2) {
                result.push({
                    ...rs,
                    membership
                });
            }


        }
    }


    return result;
}


module.exports = {
    getRadiantReport,
    saveReportAdvice
};
