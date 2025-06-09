import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
export const getAllShower = async () => {
    try {
        const response = await axios.get(`${API_URL}/activeShower/shower`,
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
};


export const getNextShower = async () => {
    try {
        const response = await axios.get(`${API_URL}/activeShower/nextShower`,
            {
                headers: {
                    'x-token': token, // Agrega el token como encabezado x-token
                },
            }
        );
        return response.data.shower;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
}


export const duplicateRain = async (year) => {
    try {
        const response = await axios.post(`${API_URL}/activeShower/duplicateRain/year/${year}`,
            {},
            {
                headers: {
                    'x-token': token,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error duplicating rain:', error);
        throw error;
    }
};

export const getRainByYear = async (year) => {
    try {
        const response = await axios.get(`${API_URL}/activeShower/rain/year/${year}`,
            {
                headers: {
                    'x-token': token,
                },
            }
        );
        return response.data.rains;
    } catch (error) {
        console.error('Error fetching rain by ID:', error);
        throw error;
    }
};

export const createRain = async (rainData) => {
    try {
        const response = await axios.post(`${API_URL}/activeShower/rain`,
            rainData,
            {
                headers: {
                    'x-token': token,
                },
            }
        );
        return response.data.existingRain;
    } catch (error) {
        console.error('Error creating rain:', error);
        throw error;
    }
};

export const updateRain = async (id, rainData, year) => {
    try {
        const response = await axios.put(`${API_URL}/activeShower/rain/${id}/year/${year}`,
            rainData,
            {
                headers: {
                    'x-token': token,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating rain:', error);
        throw error;
    }
};

export const deleteRain = async (id, year) => {
    try {
        const response = await axios.delete(`${API_URL}/activeShower/rain/${id}/year/${year}`,
            {
                headers: {
                    'x-token': token,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting rain:', error);
        throw error;
    }
};


export const generateMeteorShowerTxt = async (year) => {
    try {
        const response = await axios.get(`${API_URL}/activeShower/generate/txt/${year}`,
            {
                headers: {
                    'x-token': token,
                    'Accept': 'text/plain', // Specify that the response is expected in plain text
                },
                responseType: 'text', // Ensure the response is treated as plain text
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error generating meteor shower txt:', error);
        throw error;
    }
}