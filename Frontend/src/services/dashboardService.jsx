import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getGeneral = async (option) => {
    const token = localStorage.getItem('authToken'); // Obtiene el token del localStorage

    try {
        console.log("skonaf")
        const response = await axios.get(`${apiUrl}/dashboard?option=${option}`,
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
