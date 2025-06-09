const { extraerUserId } = require('./extractJWT')
const pool = require('../database/connection');

const validateRol = async (req, res, next) => {
    const token = req.header('x-token');
    try {


        const userId = extraerUserId(token);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        const [userRows] = await pool.query(
            'SELECT rol FROM user WHERE id = ?',
            [userId]
        );


        if (userRows[0]?.rol !== '10000000') {
            return res.status(403).json({ message: 'Access denied: Invalid role' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    validateRol
}