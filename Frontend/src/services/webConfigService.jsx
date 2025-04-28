import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');


export const getConfig = async () => {
    try {
        console.log("Token:", token);
        const response = await axios.get(`${API_URL}/config`,
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                },
            });
        return response.data.config;
    } catch (error) {
        throw error;
    }
};

export const createConfig = async (configData) => {
    try {
        const response = await axios.post(`${API_URL}/config`, configData, {
            headers: {
                'x-token': token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateConfig = async (configId, configData) => {
    try {
        const response = await axios.put(`${API_URL}/config/${configId}`, configData, {
            headers: {
                'x-token': token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteConfig = async (configId) => {
    try {
        const response = await axios.delete(`${API_URL}/config/${configId}`, {
            headers: {
                'x-token': token,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};