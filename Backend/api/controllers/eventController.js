const pool = require('../database/connection');
require('dotenv').config();

// Obtener el próximo evento activo
const getNextEvent = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT description, event_date , startTime, endTime FROM event_config WHERE active = 1   AND isWebOpen = 1   AND event_date >= CURDATE() ORDER BY event_date ASC LIMIT 1;`);
        if (rows.length > 0) {
            let rs = rows[0]
            res.json({ rs });
        } else {
            res.status(404).json({ message: 'Fecha del evento no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Obtener todos los eventos (activos e inactivos)
const getAllEvents = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM event_config`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Obtener un evento por ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`SELECT id, event_date, startTime, endTime, description, active FROM event_config WHERE id = ?`, [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Evento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Actualizar un evento existente
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { event_date, description, startTime, endTime, isWebOpen, active, code } = req.body;
        console.log("Update Request Body:", req.body); // Log request body for debugging

        // Verificar si el evento existe
        const [existingEvent] = await pool.query(`SELECT * FROM astro.event_config WHERE id = ?`, [id]);
        if (existingEvent.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        const [result] = await pool.query(
            `UPDATE astro.event_config SET event_date = ?, description = ?, startTime = ?, endTime = ?, isWebOpen = ?, active = ?, code = ? WHERE id = ?`,
            [event_date, description, startTime, endTime, isWebOpen, active, code, id]
        );

        if (result.affectedRows > 0) {
            // Return the updated event data, including isWebOpen and code
            const [updatedEvent] = await pool.query(`SELECT * FROM astro.event_config WHERE id = ?`, [id]);
            res.json(updatedEvent[0]); // Return the full updated object
        } else {
            res.status(404).json({ message: 'Evento no encontrado' });
        }
    } catch (error) {
        console.error("Error updating event:", error); // Use console.error for errors
        res.status(500).json({ error: error.message });
    }
}

// Crear un nuevo evento
const createEvent = async (req, res) => {
    try {
        const { event_date, description, startTime, endTime, isWebOpen, active, code } = req.body;
        console.log("Create Request Body:", req.body); // Log request body for debugging

        // Validación básica
        if (!event_date || !description) {
            return res.status(400).json({ message: 'Fecha y descripción son requeridos' });
        }

        const [result] = await pool.query(
            `INSERT INTO astro.event_config (event_date, description, active, startTime, endTime, isWebOpen, code) VALUES(?, ?, ?, ?, ?, ?, ?);`,
            [event_date, description, active, startTime, endTime, isWebOpen, code]
        );

        // Fetch the newly created event to ensure all fields are returned consistently
        const [newEvent] = await pool.query(`SELECT * FROM astro.event_config WHERE id = ?`, [result.insertId]);

        res.status(201).json(newEvent[0]); // Return the full new object
    } catch (error) {
        console.error("Error creating event:", error); // Use console.error for errors
        res.status(500).json({ error: error.message });
    }
}

// Eliminar un evento
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el evento existe
        const [existingEvent] = await pool.query(`SELECT * FROM event_config WHERE id = ?`, [id]);
        if (existingEvent.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        const [result] = await pool.query(`DELETE FROM event_config WHERE id = ?`, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Evento eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Evento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNextEvent,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};