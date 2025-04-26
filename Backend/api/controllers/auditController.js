const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();
const auditEvent = require('../middlewares/audit');
const { start } = require('repl');


const auditC = async (req, res) => {
    try {
        console.log(req.body.data)
        const report_id = req.body.data.reportId ?? '-1';
        const token = req.header('x-token');
        let user_id = -1;
        if (token) {
            user_id = extraerUserId(token);
        }


        const isGuest = req.body.data.isGuest ?? 0;
        const isMobile = req.body.data.isMobile ?? 0;
        const event_type = req.body.data.event_type ?? 'unknown';
        const button_name = req.body.data.button_name ?? 'unknown';
        const event_target = req.body.data.event_target ?? 'unknown';

        const re = auditEvent(event_type, user_id, button_name, report_id, isGuest, event_target, isMobile)

        res.status(201).json({ message: 'Audit event logged successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

const getAuditEventsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

        console.log(startDate, adjustedEndDate.toISOString().split('T')[0]);
        const [list] = await pool.query(`SELECT * FROM audit_log al  WHERE al.timestamp BETWEEN ? AND ? `, [startDate, adjustedEndDate.toISOString().split('T')[0]]);
        const [info] = await pool.query(`
            SELECT
    SUM(CASE WHEN event_type = 'ACCESS' THEN 1 ELSE 0 END) AS access_count,
    SUM(CASE WHEN isMobile IS FALSE THEN 1 ELSE 0 END) AS not_mobile_count,
    SUM(CASE WHEN isMobile IS TRUE THEN 1 ELSE 0 END) AS is_mobile_count,
    SUM(CASE WHEN button_name = 'UFOORBIT' THEN 1 ELSE 0 END) AS ufoorbit_count,
    SUM(CASE WHEN button_name = 'WMPL' THEN 1 ELSE 0 END) AS wmpl_count,
    SUM(CASE WHEN button_name = 'GRITSEVICH' THEN 1 ELSE 0 END) AS gritsevich_count,
    SUM(CASE WHEN button_name = 'CSV' THEN 1 ELSE 0 END) AS csv_count,
    SUM(CASE WHEN button_name = 'REGISTER' THEN 1 ELSE 0 END) AS new_user_count,
    COUNT(*) AS total_count
    FROM audit_log al
    WHERE al.timestamp BETWEEN '2025-04-23' AND '2025-04-26';
`, [startDate, endDate]);

        const [eventType] = await pool.query(`SELECT al.event_type, al.timestamp, count(*) FROM audit_log al WHERE al.timestamp BETWEEN ? AND ? GROUP BY al.event_type;`, [startDate, adjustedEndDate.toISOString().split('T')[0]]);
        const [lineChart] = await pool.query(`SELECT 
        DATE_FORMAT(al.timestamp, '%Y-%m-%d %H:00:00') AS hour,
        COUNT(*) AS access_count
        FROM audit_log al
        WHERE al.event_type = 'ACCESS'
        AND al.timestamp BETWEEN ? AND ?
        GROUP BY hour
        ORDER BY hour;
    `, [startDate, adjustedEndDate.toISOString().split('T')[0]]);

        res.status(200).json({ list, info: info[0], eventType, lineChart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    auditC, getAuditEventsByDateRange
};
