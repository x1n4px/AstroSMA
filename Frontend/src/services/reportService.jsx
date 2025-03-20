import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
export const saveReportAdvice = async (formData) => {
    try {
        const response = await axios.post(`${apiUrl}/reportz/advice`, { formData },
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


export const getReportZ = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/reportz/${id}`, {
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}



export const getReportzWithCustomSearch = async ({ heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage }) => {
    try {
        const response = await axios.get(`${apiUrl}/reportz/search`, {
            params: {
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
                actualPage
            },
            headers: {
                'x-token': token, // Agrega el token como encabezado x-token
            }
        });
        console.log(response.data); 
        return response.data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};