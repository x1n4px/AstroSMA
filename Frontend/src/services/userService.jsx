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


export const modifyUserRol = async (userId, newRol) => {
    try {
        const response = await axios.put(
            `${apiUrl}/user/updateRole`,
            { id: userId, rol: newRol },
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                    'x-rol': rol // Agrega el rol como encabezado x-rol
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error modifying user role:', error);
        throw error;
    }
};


export const modifyUserPass = async (userId, oldPassword, newPassword) => {
    try {
        console.log(userId, oldPassword, newPassword)
        const response = await axios.put(
            `${apiUrl}/user/updatePassword`,
            { id: userId, oldPassword, newPassword },
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                    'x-rol': rol // Agrega el rol como encabezado x-rol
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error modifying user password:', error);
        throw error;
    }
};