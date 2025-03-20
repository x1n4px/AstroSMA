import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken'); // Obtiene el token del localStorage


export const getPhotometryFromId = async (selectedId) => {
    try {
        const response = await axios.get(`${apiUrl}/photometry/${selectedId}`,
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
