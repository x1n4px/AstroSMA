import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getReportZ = async (id) => {
    const response = await axios.get(`${apiUrl}/reportz/${id}`);
    return response.data;
}


export const getReportZListFromRain = async(selectedCode, dateIn, dateOut, membershipThreshold, distanceThreshold) => {
    const response = await axios.post(`${apiUrl}/reportz/showerInfo/${selectedCode}/${dateIn === '' ? null : dateIn }/${dateOut === '' ? null : dateOut }`, {membershipThreshold, distanceThreshold});
    return response.data;
}

export const getRelatedReportsByReportZId = async(id) => {
    const response = await axios.get(`${apiUrl}/reportz/${id}/related`);
    return response.data;
}

export const getReportMediaByReportZId = async(id) => {
    const response = await axios.get(`${apiUrl}/reportz/${id}/media`);
    return response.data;
}

 
