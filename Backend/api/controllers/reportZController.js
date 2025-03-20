const pool = require('../database/connection');
const { transform } = require('../middlewares/convertSexagesimalToDecimal');


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
        const { id } = req.params;
        const [report] = await pool.query('SELECT iz.*, la.Lluvia_Identificador FROM Informe_Z iz JOIN Lluvia_activa la WHERE IdInforme = ?', [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [obs2] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número2]);
        const [zwo] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme = ?', [id]);
        const [orbitalElement] = await pool.query('select * from Elementos_Orbitales eo where eo.Informe_Z_IdInforme = ?', [id]);
        const [trajectory] = await pool.query('SELECT * FROM Trayectoria_medida WHERE Informe_Z_IdInforme = ?', [id]);
        const [regressionTrajectory] = await pool.query('SELECT * FROM Trayectoria_por_regresion WHERE Informe_Z_IdInforme = ?', [id]);
        const [activeShower] = await pool.query('SELECT * FROM Lluvia_activa WHERE Informe_Z_IdInforme = ?', [id]);
        const [photometryReport] = await pool.query('SELECT if2.Identificador FROM Informe_Fotometria if2 JOIN Meteoro m ON if2.Meteoro_Identificador = m.Identificador JOIN Informe_Z iz ON iz.Meteoro_Identificador = m.Identificador WHERE iz.IdInforme = ?', [id]);

        const response = {
            informe: report[0],
            observatorios: [
                obs1.length > 0 ? transform(obs1[0]) : null, // Manejar el caso en que obs1 esté vacío
                obs2.length > 0 ? transform(obs2[0]) : null  // Manejar el caso en que obs2 esté vacío
            ],
            zwo: zwo,
            orbitalElement: orbitalElement,
            trajectory: trajectory,
            regressionTrajectory: regressionTrajectory,
            activeShower: activeShower,
            photometryReport: photometryReport
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

        console.log(formData);

        res.json({ message: 'ok' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getReportzWithCustomSearch = async (req, res) => {
    try {
        const { heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage } = req.query;

        console.log(heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage);
        const offs = actualPage * 50;
        const [count] = await pool.query('SELECT count(Informe_Z.IdInforme) as c  FROM Informe_Z WHERE Fecha BETWEEN ? AND ?', [startDate, endDate])
        const [reports] = await pool.query('SELECT Informe_Z.IdInforme , Informe_Z.Fecha  FROM Informe_Z WHERE Fecha BETWEEN ? AND ? LIMIT 50 OFFSET ?;', [startDate, endDate, offs])


        res.json({ count, reports });

    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};



module.exports = {
    getAllReportZ,
    getReportZ,
    saveReportAdvice,
    getReportzWithCustomSearch
};
