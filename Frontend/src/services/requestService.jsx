import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');



export const createRequest = async (requestData) => {
    try {
        const response = await axios.post(`${apiUrl}/request`, requestData, {
            headers: { 'x-token': token },
        });
        console.log('Request created successfully:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRequests = async (isAdminView = false) => {
    try {
        console.log(isAdminView)
        const response = await axios.get(`${apiUrl}/request`, {
            headers: { 'x-token': token },
            params: { isAdminView }
        });

        return response.data.requests;
    } catch (error) {
        console.error('Error fetching requests:', error);
        throw error;
    }
};

export const getRequest = async (requestId) => {
    try {
        const response = await axios.get(`${apiUrl}/request/${requestId}`,{
            headers: { 'x-token': token },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateRequest = async (requestId, status) => {
    try {
        console.log('Updating request:', requestId, status);
        const response = await axios.put(`${apiUrl}/request/${requestId}`, status,
            {
                headers: { 'x-token': token },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRequest = async (requestId) => {
    try {
        const response = await axios.delete(`${apiUrl}/requests/${requestId}`,{
            headers: { 'x-token': token },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};