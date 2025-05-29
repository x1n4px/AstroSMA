// middlewares/checkUserBlockedByIp.js
const pool = require('../database/connection');

const checkUserBlockedByIp = async (req, res, next) => {
    try {
        const clientIp = req.header('x-client-ip');
        if (!clientIp) {
            return res.status(400).json({ message: 'Missing IP address in headers' });
        }

        // Buscar la IP en la tabla user_ips
        const [ipRows] = await pool.query(
            'SELECT user_id FROM user_ips WHERE ip_address = ?',
            [clientIp]
        );

        if (ipRows.length === 0) {
            return next();
        }

        const userId = ipRows[0].user_id;

        // Buscar el usuario y su estado de bloqueo
        const [userRows] = await pool.query(
            'SELECT is_blocked FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found for this IP address' });
        }

        if (userRows[0].is_blocked) {
            return res.status(403).json({ message: 'Access denied: user is blocked' });
        }

        // Todo bien, continúa con la siguiente función
        next();
    } catch (error) {
        console.error('Error in checkUserBlockedByIp middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    checkUserBlockedByIp
}