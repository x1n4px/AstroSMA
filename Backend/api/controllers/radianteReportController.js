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


module.exports = {
    getRadiantReport,
    saveReportAdvice
};
