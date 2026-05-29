import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;


export const getPhotometryFromId = async (selectedId) => {
    const response = await axios.get(`${apiUrl}/photometry/${selectedId}`);
    return response.data;
};

export const getPhotometryGraph = async (selectedId) => {
    const response = await axios.get(`${apiUrl}/photometry/${selectedId}/graph`, {
        responseType: 'blob'
    });
    return response.data;
};
