const pool = require('../database/connection');

const auditEvent = async (eventType, userId, buttonName = null, reportId = null) => {
    try {
        let query = '';

        query = `INSERT INTO auditing (event_type, user_id, button_name, report_id, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;

        // Ejecutar la consulta de auditoría
        const [result] = await pool.query(query, [eventType, userId, buttonName, reportId]);

        // Verificar si la inserción fue exitosa
        if (result.affectedRows > 0) {
            return true; // Si se guardó correctamente
        } else {
            return false; // Si no se guardó correctamente
        }
    } catch (error) {
        console.error('Error al registrar el evento de auditoría:', error);
        return false; // En caso de error, retornar false
    }
};

module.exports = auditEvent;
