const pool = require('../database/connection');
const { extraerUserId } = require('../middlewares/extractJWT')
const { isAdminUser } = require('../utils/roleMaskUtils')
const { transform, convertSexagesimalToDecimal, individuaConvertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');
const { convertCoordinates } = require('../middlewares/convertCoordinates');
const { QR_USER_ROL } = require('../utils/roleMaskUtils')

// Función para obtener un empleado por su ID
const getAllReportZ = async (req, res) => {
    try {
        const [reports] = await pool.query('SELECT * FROM Informe_Z');
        res.json(reports);
    } catch (error) {
        console.error('Error al obtener las estaciones:', error);
        throw error;
    }
};

const getReportZ = async (req, res) => {
    try {
        const token = req.header('x-token');
        let user_id = null;
        let rol = QR_USER_ROL;

        if (token) {
            try {
                user_id = extraerUserId(token);
                if (user_id) {
                    const [rolD] = await pool.query('SELECT rol FROM user WHERE id = ?', [user_id]);
                    if (rolD.length > 0) {
                        rol = rolD[0].rol;
                    }
                }
            } catch (error) {
                console.error('Error processing token:', error);
                // Continue with default role
            }
        }

        const { id } = req.params;
        const [report] = await pool.query('SELECT iz.* FROM Informe_Z iz WHERE IdInforme = ?', [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        const processedReports = report.map(report => {
            return {
                ...report,
                Inicio_de_la_trayectoria_Estacion_1: (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_1)),
                Fin_de_la_trayectoria_Estacion_1: (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_1)),
                Inicio_de_la_trayectoria_Estacion_2: (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_2)),
                Fin_de_la_trayectoria_Estacion_2: (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_2)),
                Impacto_previsible: (convertCoordinates(report.Impacto_previsible + " 0.0 0.0", false))
            };
        });

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        let advice = [];
        if (isAdminUser(rol)) {
            [advice] = await pool.query('SELECT * FROM Informe_Error ie WHERE ie.Informe_Z_Id = ? AND ie.status = 1;', [id]);
        } else {
            [advice] = await pool.query('SELECT * FROM Informe_Error ie WHERE ie.user_Id = ? AND ie.Informe_Z_Id = ?  AND ie.status = 1;', [user_id, id]);
        }

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [obs2] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número2]);
        const [zwo] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme = ?', [id]);
        const [orbitalElement] = await pool.query(`
            SELECT 
  ob.Informe_Z_IdInforme,
  ob.Calculados_con,
  SUBSTRING_INDEX(ob.Vel__Inf, ' ', 1) AS Vel__Inf,
  SUBSTRING_INDEX(ob.Vel__Geo, ' ', 1) AS Vel__Geo,
  SUBSTRING_INDEX(ob.Ar, ' ', 1) AS Ar,
  SUBSTRING_INDEX(ob.De, ' ', 1) AS De,
  SUBSTRING_INDEX(ob.i, ' ', 1) AS i,
  SUBSTRING_INDEX(ob.p, ' ', 1) AS p,
  SUBSTRING_INDEX(ob.a, ' ', 1) AS a,
  SUBSTRING_INDEX(ob.e, ' ', 1) AS e,
  SUBSTRING_INDEX(ob.q, ' ', 1) AS q,
  SUBSTRING_INDEX(ob.T, ' ', 1) AS T,
  SUBSTRING_INDEX(ob.omega, ' ', 1) AS omega,
SUBSTRING_INDEX(SUBSTRING(ob.Omega_grados_votos_max_min, 2), ' ', 1) AS Omega_grados_votos_max_min,
	iz.Fecha, iz.Hora
FROM 
  Elementos_Orbitales ob
JOIN Informe_Z iz ON iz.IdInforme = ob.Informe_Z_IdInforme
WHERE 
  ob.Informe_Z_IdInforme = ?
;

            `, [id]);
        const [trajectoryPre] = await pool.query('SELECT * FROM Trayectoria_medida WHERE Informe_Z_IdInforme = ?', [id]);
        const [regressionTrajectory] = await pool.query('SELECT * FROM Trayectoria_por_regresion WHERE Informe_Z_IdInforme = ?', [id]);
        const [photometryReport] = await pool.query('SELECT if2.Identificador FROM Informe_Fotometria if2 JOIN Meteoro m ON if2.Meteoro_Identificador = m.Identificador JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador WHERE iz.IdInforme = ?', [id]);
        const [mapReportGross] = await pool.query('SELECT iz.Azimut, iz.Dist_Cenital, o.Latitud_Sexagesimal as obs1Lon, o.Longitud_Sexagesimal as obs1Lat, o2.Latitud_Sexagesimal as obs2Lon, o2.Longitud_Sexagesimal as obs2Lat from Informe_Z iz JOIN Observatorio o ON o.Número = iz.Observatorio_Número JOIN Observatorio o2 ON o2.Número = iz.Observatorio_Número2 where iz.IdInforme = ?;', [id]);
        const mapReport = calculateBolidePosition(mapReportGross[0].Azimut, mapReportGross[0].Dist_Cenital, mapReportGross[0].obs1Lat, mapReportGross[0].obs1Lon, mapReportGross[0].obs2Lat, mapReportGross[0].obs2Lon)
        const [observatory_name] = await pool.query('SELECT Nombre_Observatorio FROM Observatorio WHERE Número = ?', [report[0].Observatorio_Número]);
        const [slopeMapUNF] = await pool.query(`SELECT iz.IdInforme, iz.Inicio_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_2, iz.Fecha, iz.Hora FROM Informe_Z iz WHERE iz.IdInforme = ?;`, [id]);

        const slopeMap = slopeMapUNF.map((item) => {
            return {
                AUX: {
                    Fecha: item.Fecha,
                    Hora: item.Hora,
                    IdInforme: item.IdInforme
                },
                MAP_DATA: {
                    st1: {
                        start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_1, false),
                        end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_1, false),
                        id: item.IdInforme
                    },
                    st2: {
                        start: convertCoordinates(item.Inicio_de_la_trayectoria_Estacion_2, false),
                        end: convertCoordinates(item.Fin_de_la_trayectoria_Estacion_2, false),
                        id: item.IdInforme
                    }
                }

            }
        })

        const trajectory = trajectoryPre.map(item => {
            return {
                ...item,
                lambda: individuaConvertSexagesimalToDecimal(item.lambda),
                phi: individuaConvertSexagesimalToDecimal(item.phi),
                AR_Estacion_1: individuaConvertSexagesimalToDecimal(item.AR_Estacion_1),
                De_Estacion_1: individuaConvertSexagesimalToDecimal(item.De_Estacion_1),
                Ar_Estacion_2: individuaConvertSexagesimalToDecimal(item.Ar_Estacion_2),
                De_Estacion_2: individuaConvertSexagesimalToDecimal(item.De_Estacion_2),
            }
        })


        let IMOS = await IMOShowers(report[0].IdInforme);
        let IAUS = await IAUShowers(report[0].IdInforme, report[0].Fecha);

        const response = {
            informe: processedReports[0],
            observatorios: [
                obs1.length > 0 ? transform(obs1[0]) : null, // Manejar el caso en que obs1 esté vacío
                obs2.length > 0 ? transform(obs2[0]) : null  // Manejar el caso en que obs2 esté vacío
            ],
            zwo: zwo,
            orbitalElement: orbitalElement,
            trajectory: trajectory,
            regressionTrajectory: regressionTrajectory,
            activeShower: IMOS,
            photometryReport: photometryReport,
            mapReport: mapReport,
            advice: advice,
            observatoryName: observatory_name[0].Nombre_Observatorio,
            slopeMap: slopeMap,
            showers: IAUS
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

        await pool.execute(`INSERT INTO Informe_Error (Informe_Z_Id, Tab, Description, user_Id, status) VALUES (${Id}, '${Tab.toString()}', '${Description.toString()}', ${user_id}, 1)`);
        res.json({ message: 'Informe de error guardado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteReportAdvice = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute('UPDATE Informe_Error SET status = 0 WHERE Id = ?;', [id]);
        res.json({ message: 'Informe de error eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

const getReportzWithCustomSearch = async (req, res) => {
    try {
        const { heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage } = req.query;

        const offs = actualPage * 50;
        const [count] = await pool.query('SELECT count(Informe_Z.IdInforme) as c  FROM Informe_Z WHERE Fecha BETWEEN ? AND ?', [startDate, endDate])
        const [reports] = await pool.query('SELECT Informe_Z.IdInforme , Informe_Z.Fecha  FROM Informe_Z WHERE Fecha BETWEEN ? AND ? LIMIT 50 OFFSET ?;', [startDate, endDate, offs])


        res.json({ count, reports });

    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



const calculateBolidePosition = (azimut, distanciaCenital, obs1Lat, obs1Lon, obs2Lat, obs2Lon) => {

    const toRadians = (deg) => deg * (Math.PI / 180);
    const toDegrees = (rad) => rad * (180 / Math.PI);


    // Función para calcular el punto medio entre dos observatorios
    const puntoMedio = (lat1, lon1, lat2, lon2) => {
        let lat1Rad = toRadians(lat1);
        let lon1Rad = toRadians(lon1);
        let lat2Rad = toRadians(lat2);
        let lon2Rad = toRadians(lon2);

        let dLon = lon2Rad - lon1Rad;
        let bx = Math.cos(lat2Rad) * Math.cos(dLon);
        let by = Math.cos(lat2Rad) * Math.sin(dLon);

        let latMed = Math.atan2(Math.sin(lat1Rad) + Math.sin(lat2Rad),
            Math.sqrt((Math.cos(lat1Rad) + bx) ** 2 + by ** 2));
        let lonMed = lon1Rad + Math.atan2(by, Math.cos(lat1Rad) + bx);

        return {
            latitude: toDegrees(latMed),
            longitude: toDegrees(lonMed)
        };
    };

    // Función para calcular desplazamiento usando azimut y distancia cenital
    const haversineOffset = (lat, lon, azimuth, distanceKm) => {
        const R = 6371; // Radio de la Tierra en km
        let latRad = toRadians(lat);
        let lonRad = toRadians(lon);
        let azimuthRad = toRadians(azimuth);
        let distanceRad = distanceKm / R;

        // Nueva latitud
        let newLat = Math.asin(Math.sin(latRad) * Math.cos(distanceRad) +
            Math.cos(latRad) * Math.sin(distanceRad) * Math.cos(azimuthRad));

        // Nueva longitud
        let newLon = lonRad + Math.atan2(
            Math.sin(azimuthRad) * Math.sin(distanceRad) * Math.cos(latRad),
            Math.cos(distanceRad) - Math.sin(latRad) * Math.sin(newLat)
        );

        return {
            latitude: toDegrees(newLat),
            longitude: toDegrees(newLon)
        };
    };


    // Convertir coordenadas del primer observatorio
    const latObs1 = convertSexagesimalToDecimal(obs1Lat);
    const lonObs1 = convertSexagesimalToDecimal(obs1Lon);

    // Convertir coordenadas del segundo observatorio
    const latObs2 = convertSexagesimalToDecimal(obs2Lat);
    const lonObs2 = convertSexagesimalToDecimal(obs2Lon);

    // Calcular punto medio
    const { latitude, longitude } = puntoMedio(latObs1, lonObs1, latObs2, lonObs2);

    // Convertir distancia cenital a kilómetros (suponiendo altura de entrada de 100 km)
    const alturaEntradaKm = 100;
    const distanciaKm = Math.tan(toRadians(distanciaCenital)) * alturaEntradaKm;

    // Calcular la nueva posición
    return haversineOffset(latitude, longitude, azimut, distanciaKm);
}









// -------------------------------------------------------------------  fuzzy logic ----------------------------------------------------

function membershipDMRT(DMRT) {
    const umbral = 5;
    const max = 50; // más permisivo que 30
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
    const tolerancia = 1.5; // en UA — mucho más flexible que 0.5
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
    const pertenenciaDMRTV = membershipDMRT(parseFloat(shower.Distancia_mínima_entre_radianes_y_trayectoria));
    const membershipE = membershipEccentricity(parseFloat(bolide.e), parseFloat(shower.e));
    const membershipA = membershipSemiMajorAxis(parseFloat(bolide.a), parseFloat(shower.a));
    const membershipQ = membershipPerihelion(parseFloat(bolide.q), parseFloat(shower.q));


    const totalMembership =
        (pertenenciaDMRTV * 0.4) +
        (membershipE * 0.2) +
        (membershipA * 0.2) +
        (membershipQ * 0.2);

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

    const [lluvias] = await pool.query(`
        SELECT ms.Code, ms.Activity, ms.SubDate, ms.Ra as Ra, ms.De, ms.E as e, ms.A as a, ms.Q as q
                FROM meteor_showers ms
                WHERE ms.Code != ""
                AND ms.SubDate BETWEEN DATE_SUB(?, INTERVAL 1 MONTH) AND DATE_ADD(?, INTERVAL 1 MONTH)
                GROUP BY ms.Code, ms.Status
                ORDER BY ms.SubDate DESC;
    `, [report.Fecha, report.Fecha]);

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
            result.push({
                ...rs,
                membership
            });
        }
    }



    return result;
}




const testing = async (req, res) => {
    try {
        let id = 4;
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

        const [lluvias] = await pool.query(`
            SELECT ms.Code, ms.Activity, ms.SubDate, ms.Ra as Ra, ms.De, ms.E as e, ms.A as a, ms.Q as q
                    FROM meteor_showers ms
                    WHERE ms.Code != ""
                    AND ms.SubDate BETWEEN DATE_SUB(?, INTERVAL 1 MONTH) AND DATE_ADD(?, INTERVAL 1 MONTH)
                    GROUP BY ms.Code, ms.Status
                    ORDER BY ms.SubDate DESC;
        `, [report.Fecha, report.Fecha]);

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
                result.push({
                    ...rs,
                    membership
                });
            }
        }





        res.json({ result });

    } catch (error) {
        console.error('Error al obtener las estaciones:', error);
        res.status(500).json({ error: 'Error al obtener las estaciones' });
    }
};




module.exports = {
    getAllReportZ,
    getReportZ,
    saveReportAdvice,
    getReportzWithCustomSearch,
    testing,
    deleteReportAdvice
};
