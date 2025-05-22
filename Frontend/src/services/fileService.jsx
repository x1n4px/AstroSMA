import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getOrbitFile = async (button, Fecha, Hora, fileName, id1, id2) => {
    try {
        // Extract date components
        const year = Fecha.substring(0,4);
        const month = Fecha.substring(5,7);
        const day = Fecha.substring(8,10);

        // Extract time components
        const hour = Hora.substring(0,2);
        const minute = Hora.substring(3,5); 
        const second = Hora.substring(6,8);

        const response = await axios.get(`${apiUrl}/detecciones`, {
            params: {
              button, year, month, day, hour, minute, second, fileName, id1, id2
            }
          });
          
        return response.data;
    } catch (error) {
        console.log('Error fetching file:', error);
        throw error;
    }
};
