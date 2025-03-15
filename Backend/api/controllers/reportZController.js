
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
        const [report] = await pool.query('SELECT * FROM Informe_Z WHERE id = ?', [id]);
        res.json(report[0]);
    } catch (error) {
        console.error('Error al obtener la estación:', error);
        throw error;
    }
}




module.exports = {
    getAllReportZ,
    getReportZ
};
