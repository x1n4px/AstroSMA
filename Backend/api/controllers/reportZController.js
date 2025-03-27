const pool = require('../database/connection');
const { extraerUserId } = require('../middlewares/extractJWT')

const { transform, convertSexagesimalToDecimal } = require('../middlewares/convertSexagesimalToDecimal');
const {convertCoordinates} = require('../middlewares/convertCoordinates');

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
                Inicio_de_la_trayectoria_Estacion_1:  (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_1)),
                Fin_de_la_trayectoria_Estacion_1:  (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_1)),
                Inicio_de_la_trayectoria_Estacion_2:  (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_2)),
                Fin_de_la_trayectoria_Estacion_2:  (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_2))
            };
        });

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [obs2] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número2]);
        const [zwo] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme = ?', [id]);
        const [orbitalElement] = await pool.query('select eo.*, iz.Fecha, iz.Hora from Elementos_Orbitales eo JOIN Informe_Z iz ON iz.IdInforme = eo.Informe_Z_IdInforme where eo.Informe_Z_IdInforme = ?', [id]);
        const [trajectory] = await pool.query('SELECT * FROM Trayectoria_medida WHERE Informe_Z_IdInforme = ?', [id]);
        const [regressionTrajectory] = await pool.query('SELECT * FROM Trayectoria_por_regresion WHERE Informe_Z_IdInforme = ?', [id]);
        const [activeShower] = await pool.query('SELECT la.*, l.* FROM Lluvia_activa la JOIN Lluvia l ON l.Identificador = la.Lluvia_Identificador WHERE la.Informe_Z_IdInforme = ? GROUP BY la.Lluvia_Identificador', [id]);
        const [photometryReport] = await pool.query('SELECT if2.Identificador FROM Informe_Fotometria if2 JOIN Meteoro m ON if2.Meteoro_Identificador = m.Identificador JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador WHERE iz.IdInforme = ?', [id]);
        const [mapReportGross] = await pool.query('SELECT iz.Azimut, iz.Dist_Cenital, o.Latitud_Sexagesimal as obs1Lon, o.Longitud_Sexagesimal as obs1Lat, o2.Latitud_Sexagesimal as obs2Lon, o2.Longitud_Sexagesimal as obs2Lat from Informe_Z iz JOIN Observatorio o ON o.Número = iz.Observatorio_Número JOIN Observatorio o2 ON o2.Número = iz.Observatorio_Número2 where iz.IdInforme = ?;', [id]);
        const mapReport = calculateBolidePosition(mapReportGross[0].Azimut, mapReportGross[0].Dist_Cenital, mapReportGross[0].obs1Lat, mapReportGross[0].obs1Lon, mapReportGross[0].obs2Lat, mapReportGross[0].obs2Lon)
        const [advice] = await pool.query('SELECT * FROM Informe_Error ie WHERE ie.user_Id = ? AND ie.Informe_Z_Id = ?;', [user_id, id]);
        const [observatory_name] = await pool.query('SELECT Nombre_Observatorio FROM Observatorio WHERE Número = ?', [report[0].Observatorio_Número]);

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


// Test function to verify the module is working
const testing = async (req, res) => {
    try {
        const [reports] = await pool.query("SELECT * FROM Informe_Z WHERE IdInforme = 202");
        
        const processedReports = reports.map(report => {
            return {
                ...report,
                Inicio_de_la_trayectoria_Estacion_1:  (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_1)),
                Fin_de_la_trayectoria_Estacion_1:  (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_1)),
                Inicio_de_la_trayectoria_Estacion_2:  (convertCoordinates(report.Inicio_de_la_trayectoria_Estacion_2)),
                Fin_de_la_trayectoria_Estacion_2:  (convertCoordinates(report.Fin_de_la_trayectoria_Estacion_2))
            };
        });
        
        res.json(processedReports);
    } catch (error) {
        console.error('Error al obtener las estaciones:', error);
        throw error;
    }
};


module.exports = {
    getAllReportZ,
    getReportZ,
    saveReportAdvice,
    getReportzWithCustomSearch,
    testing
};
