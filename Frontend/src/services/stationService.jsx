import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
export const getStations = async () => {

    try {
        const response = await axios.get(`${apiUrl}/stations`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getNearbyStation = async (lat, lon, radius) => {
    try {
        const response = await axios.get(`${apiUrl}/stations/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const getAsocciatedStations = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/stations/associated/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const updateStationStatus = async (id) => {
    try {
        const response = await axios.patch(`${apiUrl}/stations/${id}/status`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createStation = async (station) => {
    try {
        const response = await axios.post(`${apiUrl}/stations`, station);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateStation = async (id, station) => {
    try {
        const response = await axios.put(`${apiUrl}/stations/${id}/details`, station);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteStation = async (id) => {
    try {
        const response = await axios.delete(`${apiUrl}/stations/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
