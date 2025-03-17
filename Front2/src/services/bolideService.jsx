import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getAllBolide = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
};


export const getAllBolideLastSixMonths = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/months`);
        return response.data.filteredData;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
}

export const getAllBolideLastSixMonthsWithInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/months`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
}




export const getBolideById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/${id}`);
        return [response.data];
    } catch (error) {
        console.error(`Error fetching bolides with ID: ${id}:`, error);
        throw error;
    }
}


export const getLastTenBolide = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/comparation`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getLastTWoBolide = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/comparation/two`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getBolideWithCustomSearch = async ({ heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate }) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/search`, {
            params: {
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};