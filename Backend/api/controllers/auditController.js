const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();
const auditEvent = require('../middlewares/audit')


const auditC = async (req, res) => {
    try {
        console.log(req.body.data)
        const btn = req.body.data.fileName
        const reportId = req.body.data.reportId ?? 0;
        const token = req.header('x-token');
        const id = extraerUserId(token);

        const re = auditEvent('Download', id, btn, reportId)

        res.status(201).json({ message: 'Audit event logged successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    auditC
};
