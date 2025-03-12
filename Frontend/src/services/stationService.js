import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getStations = async () => {
    try {
        const response = await axios.get(`${API_URL}/stations`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
