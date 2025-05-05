import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
const rol = localStorage.getItem('rol');

export const getNextEvent = async () => {
    try {
        const response = await axios.get(`${apiUrl}/event/next`);
        return (response.data.rs);
    } catch (error) {
        throw error;
    }
};

export const getAllEvents = async () => {
    try {
        const response = await axios.get(`${apiUrl}/event/all`, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            }
        });
        return (response.data);
    } catch (error) {
        throw error;
    }
}

export const getEventById = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/event/${id}`, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            }
        });
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const createEvent = async (eventData) => {
    try {
        const response = await axios.post(`${apiUrl}/event`, eventData, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            }
        });
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const updateEvent = async (id, eventData) => {
    try {
        const response = await axios.put(`${apiUrl}/event/${id}`, eventData, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            }
        });
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const response = await axios.delete(`${apiUrl}/event/${id}`, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            }
        });
        return (response.data);
    } catch (error) {
        throw error;
    }
};
