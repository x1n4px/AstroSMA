import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getCountry = async (email, password) => {
    try {
        const response = await axios.get(`${apiUrl}/auxiliary/country`);
        return response.data.country;
    } catch (error) {
        throw error;
    }
};
