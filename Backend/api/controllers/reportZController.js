const pool = require('../database/connection');
const { extraerUserId } = require('../middlewares/extractJWT')

const { transform, convertSexagesimalToDecimal, individuaConvertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');
const { convertCoordinates } = require('../middlewares/convertCoordinates');

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
        const user_id = extraerUserId(token);
        const { id } = req.params;
        const [report] = await pool.query('SELECT iz.* FROM Informe_Z iz WHERE IdInforme = ?', [id]);
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

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [obs2] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número2]);
        const [zwo] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme = ?', [id]);
        const [orbitalElement] = await pool.query('select eo.*, iz.Fecha, iz.Hora from Elementos_Orbitales eo JOIN Informe_Z iz ON iz.IdInforme = eo.Informe_Z_IdInforme where eo.Informe_Z_IdInforme = ?', [id]);
        const [trajectoryPre] = await pool.query('SELECT * FROM Trayectoria_medida WHERE Informe_Z_IdInforme = ?', [id]);
        const [regressionTrajectory] = await pool.query('SELECT * FROM Trayectoria_por_regresion WHERE Informe_Z_IdInforme = ?', [id]);
        const [activeShower] = await pool.query('SELECT la.*, l.* FROM Lluvia_activa la JOIN Lluvia l ON l.Identificador = la.Lluvia_Identificador WHERE la.Informe_Z_IdInforme = ? GROUP BY la.Lluvia_Identificador', [id]);
        const [photometryReport] = await pool.query('SELECT if2.Identificador FROM Informe_Fotometria if2 JOIN Meteoro m ON if2.Meteoro_Identificador = m.Identificador JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador WHERE iz.IdInforme = ?', [id]);
        const [mapReportGross] = await pool.query('SELECT iz.Azimut, iz.Dist_Cenital, o.Latitud_Sexagesimal as obs1Lon, o.Longitud_Sexagesimal as obs1Lat, o2.Latitud_Sexagesimal as obs2Lon, o2.Longitud_Sexagesimal as obs2Lat from Informe_Z iz JOIN Observatorio o ON o.Número = iz.Observatorio_Número JOIN Observatorio o2 ON o2.Número = iz.Observatorio_Número2 where iz.IdInforme = ?;', [id]);
        const mapReport = calculateBolidePosition(mapReportGross[0].Azimut, mapReportGross[0].Dist_Cenital, mapReportGross[0].obs1Lat, mapReportGross[0].obs1Lon, mapReportGross[0].obs2Lat, mapReportGross[0].obs2Lon)
        const [advice] = await pool.query('SELECT * FROM Informe_Error ie WHERE ie.user_Id = ? AND ie.Informe_Z_Id = ?;', [user_id, id]);
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

        const [showers] = await pool.query(
            `SELECT ms.Code, ms.Status, MAX(ms.SubDate) AS SubDate
             FROM meteor_showers ms 
             WHERE MONTH(ms.SubDate) = MONTH(?)  
             AND YEAR(ms.SubDate) = YEAR(?)
             AND ms.Code != ""
             GROUP BY ms.Code, ms.Status
             ORDER BY SubDate DESC;`,
            [report[0].Fecha, report[0].Fecha]
        );


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
            activeShower: activeShower,
            photometryReport: photometryReport,
            mapReport: mapReport,
            advice: advice,
            observatoryName: observatory_name[0].Nombre_Observatorio,
            slopeMap: slopeMap,
            ...(activeShower.length === 0 && { showers: showers })
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





const testing = async (req, res) => {
    try {

        const [reports] = await pool.query(` SELECT iz.IdInforme, iz.Fecha FROM Informe_Z iz WHERE iz.IdInforme = 4`);
        const report = reports[0];  // Aquí obtienes el primer elemento del array

        const [orbital] = await pool.query(`SELECT SUBSTRING_INDEX(eo.e, ' ',1) as e, SUBSTRING_INDEX(eo.a,' ',1) as a, SUBSTRING_INDEX(eo.q,' ', 1) as q, SUBSTRING_INDEX(eo.Ar, ' ',1) as Ar, SUBSTRING_INDEX(eo.De, ' ',1) as De FROM Elementos_Orbitales eo WHERE eo.Informe_Z_IdInforme = ?;`, [report.IdInforme]);
        const [lluvias] = await pool.query(`
            SELECT la.* 
            FROM Lluvia_activa la  
            JOIN Informe_Z iz ON iz.IdInforme = la.Informe_Z_IdInforme 
            WHERE iz.IdInforme = ?;
        `, [report.IdInforme]);
        
        let lluvias_datos = [];
        
        for (const lluvia of lluvias) {
            // Remover caracteres no alfabéticos de Lluvia_Identificador
            let id = lluvia.Lluvia_Identificador.replace(/[^a-zA-Z]/g, '');
            
            // Obtener los datos de lluvia
            const [lluviaData] = await pool.query(`
                SELECT ms.Code, AVG(Ra) AS Ar, AVG(De) AS De, AVG(E) AS e, AVG(A) AS a, AVG(Q) AS q 
                FROM meteor_showers ms 
                WHERE ms.Code LIKE ?;
            `, [id]);
        
            // Extraer el Code del resultado
            const code = lluviaData[0]?.Code?.replace(/[^a-zA-Z]/g, '');  // Asegurarse de que Code esté limpio
        
            // Comprobar si los identificadores coinciden
            if (code === id) {
                // Si coinciden, añadimos el valor de Distancia_mínima_entre_radianes_y_trayectoria
                lluviaData[0].Distancia_mínima_entre_radianes_y_trayectoria = lluvia.Distancia_mínima_entre_radianes_y_trayectoria;
            }
        
            // Añadir los datos de la lluvia con la distancia mínima
            lluvias_datos.push(lluviaData[0]);
        }
        
        let result = [];

        for(const rs of lluvias_datos) {
            for(const ob of orbital) {
                const membership = calculateMembership(ob, rs);
                result.push({
                    rs: rs,
                    ob: ob,
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


/*
const testing = async (req, res) => {
    try {
        const [reports] = await pool.query(`
            SELECT iz.IdInforme, iz.Fecha
            FROM Informe_Z iz
            WHERE iz.IdInforme = 4
        `);

        const [orbital] = await pool.query(`SELECT eo.e, eo.a, eo.q, eo.Ar, eo.De FROM Elementos_Orbitales eo WHERE eo.Informe_Z_IdInforme = ?;`, [reports[0].IdInforme]);

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
            return( decayFactor*100).toFixed(2)+ " %";
        };
        

        let result = [];

        // Usamos for...of para esperar las promesas
        for (const report of reports) {
            // Obtener los datos de los puntos zwo para el informe
            const [zwoData] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Puntos_ZWO.Informe_Z_IdInforme = ?', [report.IdInforme]);
            // Obtener los datos de las lluvias para la fecha del informe
             
            const [shower] = await pool.query(`
                SELECT ms.Code, ms.Activity, ms.SubDate, ms.Ra, ms.De
                FROM meteor_showers ms
                WHERE ms.Code != ""
                AND ms.SubDate BETWEEN DATE_SUB(?, INTERVAL 1 MONTH) AND DATE_ADD(?, INTERVAL 1 MONTH)
                GROUP BY ms.Code, ms.Status
                ORDER BY ms.SubDate DESC;
            `, [report.Fecha, report.Fecha]);
            
           


           

            // Aquí realizamos el cálculo de la distancia angular con los puntos zwo y las lluvias
            const resultado = shower.map(lluvia => {
                const cosValues = zwoData.map((punto) => { 
                    return cosDist(punto.Ar_Grados, punto.De_Grados, lluvia.Ra, lluvia.De); 
                });

                const mediaCos = cosValues.reduce((a, b) => a + b, 0) / cosValues.length;

                // Clamp del valor entre -1 y 1 para evitar errores numéricos con acos
                const clamped = Math.min(Math.max(mediaCos, -1), 1);
                const distanciaMediaRad = Math.acos(clamped);
                const distanciaMediaDeg = toDegrees(distanciaMediaRad);

                // Calculamos la probabilidad en base a la distancia
                const probabilidad = calcularProbabilidad(distanciaMediaDeg, UMBRAL_GRADOS);

                return {
                    code: lluvia.Code,
                    date: lluvia.SubDate,
                    activity: lluvia.Activity,
                    d: distanciaMediaDeg.toFixed(2),
                    //probabilidad: probabilidad
                };
            });

            // Agregamos los resultados del informe y las lluvias con sus cálculos
            result.push({
                IdInforme: report.IdInforme,
                fechaInforme: report.Fecha,
                showers: resultado // Incluimos los resultados de las lluvias
            });
        }


        // Responde con el resultado adecuado
        res.json({ orbital, result });

    } catch (error) {
        console.error('Error al obtener las estaciones:', error);
        res.status(500).json({ error: 'Error al obtener las estaciones' });
    }
};*/





module.exports = {
    getAllReportZ,
    getReportZ,
    saveReportAdvice,
    getReportzWithCustomSearch,
    testing
};
