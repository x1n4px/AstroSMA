import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');



export const getReportZ = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/reportz/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getReportZListFromRain = async(selectedCode, dateIn, dateOut, membershipThreshold, distanceThreshold) => {
    try {
        const response = await axios.post(`${apiUrl}/reportz/showerInfo/${selectedCode}/${dateIn === '' ? null : dateIn }/${dateOut === '' ? null : dateOut }`, {membershipThreshold, distanceThreshold});
        return response.data;
    } catch (error) {
        throw error;
    }
}

 


