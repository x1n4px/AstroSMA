const pool = require('../database/connection');

const auditEvent = async (event_type, user_id, button_name, report_id, isGuest, event_target, isMobile) => {
    try {
        let query = '';

        query = `INSERT INTO audit_log (event_type, user_id, button_name, report_id, isGuest, event_target, isMobile) 
                VALUES(?,?,?,?,?,?,?);`;

        // Ejecutar la consulta de auditoría
        const [result] = await pool.query(query, [event_type, user_id, button_name, report_id, isGuest, event_target, isMobile]);

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
