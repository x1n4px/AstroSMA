const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();

const getRequests = async (req, res) => {
    try {
        const id = extraerUserId(req.header('x-token'));
        const isAdminView = req.query.isAdminView;
        let requests;
        if (isAdminView === 'true') {
            [requests] = await pool.query(
                `
                (
                    SELECT r.*, 
                            u_req.name AS requester_name, u_req.surname AS requester_surname, u_req.institucion AS requester_institucion,
                            u_rev.name AS reviewer_name, u_rev.surname AS reviewer_surname, u_rev.institucion AS reviewer_institucion
                    FROM requests r
                    LEFT JOIN user u_req ON r.requester_user_id = u_req.id
                    LEFT JOIN user u_rev ON r.reviewer_user_id = u_rev.id
                    WHERE r.status = 'pending'
                    ORDER BY r.created_at DESC
                    )
                    UNION ALL
                    (
                    SELECT r.*, 
                            u_req.name AS requester_name, u_req.surname AS requester_surname, u_req.institucion AS requester_institucion,
                            u_rev.name AS reviewer_name, u_rev.surname AS reviewer_surname, u_rev.institucion AS reviewer_institucion
                    FROM requests r
                    LEFT JOIN user u_req ON r.requester_user_id = u_req.id
                    LEFT JOIN user u_rev ON r.reviewer_user_id = u_rev.id
                    WHERE r.status != 'pending'
                    ORDER BY r.created_at DESC
                    LIMIT 15
                    );
                `
            );
        } else {
            [requests] = await pool.query('SELECT * FROM requests WHERE requester_user_id = ?', [id]);
        }

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: error.message });
    }
};

const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const [request] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (request.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ request: request[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const { height, latitude, longitude, ratio, from_date, to_date, report_type, description } = req.body;
        const id = extraerUserId(req.header('x-token'));
        const [result] = await pool.query('INSERT INTO requests (requester_user_id, report_type, height, latitude, longitude, ratio, from_date, to_date, description, status) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending");', [id, report_type, height, latitude, longitude, ratio, from_date, to_date, description]);
        res.status(201).json({ message: 'Request created', id: result.insertId });
    } catch (error) {
    console.error('Error creating request:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = extraerUserId(req.header('x-token'));
        const { status } = req.body;
        const [result] = await pool.query('UPDATE requests SET status = ?, reviewer_user_id = ? WHERE id = ?', [status, adminId, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request updated' });
    } catch (error) {
    console.error('Error updating request:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM requests WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getRequests, getRequestById, createRequest, updateRequest, deleteRequest };


