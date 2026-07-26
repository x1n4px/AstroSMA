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

const adjustDateByTime = (date, time) => {
    if (!date || !time) return date;

    // Si la hora es <= 12:00:00, usar el día anterior
    if (time <= "12:00:00") {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return date;
};

export const getOrbitFile = async (button, Fecha, Hora, fileName, id1, id2) => {
    try {
        let normalizedDate = formatDateInMadrid(Fecha);

	normalizedDate = adjustDateByTime(normalizedDate, Hora);

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
