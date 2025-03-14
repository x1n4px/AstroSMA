import axios from 'axios';

 
export const getStations = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;


    try {
        const response = await axios.get(`${apiUrl}/stations`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
