import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getUser = async () => {
    try {
        const token = localStorage.getItem('authToken'); // Obtiene el token del localStorage


        const response = await axios.get(
            `${apiUrl}/user`, // Asegúrate que esta sea la ruta correcta.
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