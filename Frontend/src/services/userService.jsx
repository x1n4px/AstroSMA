import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const rol = localStorage.getItem('rol');

export const getUser = async () => {
    try {


        const response = await axios.get(
            `${apiUrl}/user`);

        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/user/all`, {
            headers: {
                'x-rol': rol // Agrega el rol como encabezado x-rol
            },
        });
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
        const response = await axios.put(
            `${apiUrl}/user/updatePassword`,
            { id: userId, oldPassword, newPassword },
            {
                headers: {
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


export const blockUser = async (userId) => {
    try {
        console.log(token);
        const response = await axios.put(
            `${apiUrl}/user/${userId}/updateUserBlockedStatus`,{},
            {
                headers: {
                    'x-rol': rol // Agrega el rol como encabezado x-rol
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
    }
}


export const unblockUser = async (userId) => {
    try {
        console.log(userId)
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error;
    }
}