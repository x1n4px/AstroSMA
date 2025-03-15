import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const loginUser = async (email, password) => {
    try {
        console.log(email, password)
        const response = await axios.post(`${apiUrl}/login`, {
            email: email,
            password: password,
        });
        
        return response.data.token;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (email, password, name, surname) => {
    try {
        const response = await axios.post(`${apiUrl}/register`, {
            email: email,
            password: password,
            name: name,
            surname: surname,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}