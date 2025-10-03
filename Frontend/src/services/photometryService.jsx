import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;


export const getPhotometryFromId = async (selectedId) => {
    try {
        const response = await axios.get(`${apiUrl}/photometry/${selectedId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
