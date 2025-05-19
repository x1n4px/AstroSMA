import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
export const getStations = async () => {

    try {
        const response = await axios.get(`${apiUrl}/stations`,
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


export const getNearbyStation = async (lat, lon, radius) => {
    try {
        const response = await axios.get(`${apiUrl}/stations/nearby?lat=${lat}&lon=${lon}&radius=${radius}`,
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
}


export const getAsocciatedStations = async (id) => {
    try {
        const response = await axios.get(`${apiUrl}/stations/associated/${id}`,
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
}


export const updateStationStatus = async (id) => {
    try {
        console.log(id)
        const response = await axios.put(`${apiUrl}/stations/${id}`,
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
}