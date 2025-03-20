import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${apiUrl}/login`, {
            email: email,
            password: password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (email, password, name, surname, countryId, institution) => {
    try {
        const response = await axios.post(`${apiUrl}/register`, {
            email: email,
            password: password,
            name: name,
            surname: surname,
            countryId: countryId,
            institution: institution,
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
}