import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
const rol = localStorage.getItem('rol');

export const audit = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/audit`, {data},
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
};


export const getDataByDateRange = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${API_URL}/audit`, {
            params: {
                startDate: startDate,
                endDate: endDate
            },
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error in getDataByDateRange:', error);
        throw error;
    }
};