const pool = require('../database/connection');


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
        const [report] = await pool.query('SELECT * FROM Informe_Z WHERE IdInforme = ?', [id]);

        if (report.length === 0) {
            return res.status(404).json({ message: 'Informe no encontrado' });
        }

        const [obs1] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número]);
        const [obs2] = await pool.query('SELECT * FROM Observatorio o WHERE o.Número = ?', [report[0].Observatorio_Número2]);
        const [zwo] = await pool.query('SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme = ?', [id]);

        const response = {
            informe: report[0],
            observatorios: [
                obs1.length > 0 ? obs1[0] : null, // Manejar el caso en que obs1 esté vacío
                obs2.length > 0 ? obs2[0] : null  // Manejar el caso en que obs2 esté vacío
            ],
            zwo: zwo // Manejar el caso en que zwo esté vacío
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener el informe:', error);
        res.status(500).json({ error: error.message });
    }
};

const saveReportAdvice = async (req, res) => {
    try {
        const {formData} = req.body;

        console.log(formData);
        
        res.json({message: 'ok'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
    getAllReportZ,
    getReportZ,
    saveReportAdvice
};
