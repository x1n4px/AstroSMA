import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const formatDateInMadrid = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    const simpleMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (simpleMatch) return raw;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getOrbitFile = async (button, Fecha, Hora, fileName, id1, id2) => {
    try {
        const normalizedDate = formatDateInMadrid(Fecha);

        const response = await axios.get(`${apiUrl}/detecciones`, {
            params: {
              button,
              date: normalizedDate,
              time: Hora,
              fileName,
              id1,
              id2
            },
            responseType: 'blob'
          });
          
        return response.data;
    } catch (error) {
        console.log('Error fetching file:', error);
        throw error;
    }
};
