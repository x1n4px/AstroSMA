import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

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
        const response = await axios.get(`${apiUrl}/event/all`);
        return (response.data);
    } catch (error) {
        throw error;
    }
}

export const getEventById = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/event/${id}`);
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const createEvent = async (eventData) => {
    try {
        const response = await axios.post(`${apiUrl}/event`, eventData);
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const updateEvent = async (id, eventData) => {
    try {
        const response = await axios.put(`${apiUrl}/event/${id}`, eventData);
        return (response.data);
    } catch (error) {
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const response = await axios.delete(`${apiUrl}/event/${id}`);
        return (response.data);
    } catch (error) {
        throw error;
    }
};
