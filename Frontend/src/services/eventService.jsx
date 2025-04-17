import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getNextEvent = async () => {
    try {
        const response = await axios.get(`${apiUrl}/event/next`);
        return (response.data);
    } catch (error) {
        throw error;
    }
};
