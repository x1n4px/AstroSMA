import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;


export const saveReportAdvice = async (formData) => {
    try {
        const response = await axios.post(`${apiUrl}/radiant-report/advice`,  {formData} );
        console.log(response)
        return response.data;

    } catch (error) {
        throw error;
    }
};


export const getRadiantReport = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/radiant-report/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

 


