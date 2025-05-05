import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const rol = localStorage.getItem('rol');
const token = localStorage.getItem('authToken');

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


export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/user/all`, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
                'x-rol': rol // Agrega el rol como encabezado x-rol
            },
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}


