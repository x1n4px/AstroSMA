import axios from 'axios';
import { ConstructionIcon } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

export const loginUser = async (email, password, isMobile) => {
    try {
        const response = await axios.post(`${apiUrl}/login`, {
            email: email,
            password: password,
            isMobile: isMobile
        });
        console.log(response.data);
         // Si la llamada es exitosa y la respuesta contiene un token
         if (response.data && response.data.token) {
            console.log('Token recibido:', response.data.token);
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('loginTime', new Date().toISOString());
           
            // Aquí también podrías guardar otra información del usuario si es necesario
            // localStorage.setItem('userId', response.data.userId);
        }
        localStorage.setItem('rol', response.data.rol);

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (email, password, name, surname, countryId, institution, isMobile) => {
    try {
        const response = await axios.post(`${apiUrl}/register`, {
            email: email,
            password: password,
            name: name,
            surname: surname,
            countryId: countryId,
            institution: institution,
            isMobile: isMobile
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
}




export const QRLogin = async (path) => {
    try {
        const response = await axios.post(`${apiUrl}/QRlogin`, {
            path: path
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const sendPasswordResetEmail = async (email) => {
    try {
        const response = await axios.post(`${apiUrl}/sendPasswordResetEmail`, { email });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const checkUuidValidity = async (token) => {
    try {
        const response = await axios.get(`${apiUrl}/checkToken?token=${token}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

 export const resetPasswordFromEmail = async (password, token) => {
    try {
        console.log(password, token);
        const response = await axios.post(`${apiUrl}/resetPassword`, { password, token });
        return response.data;
    } catch (error) {
        throw error;
    }
 }