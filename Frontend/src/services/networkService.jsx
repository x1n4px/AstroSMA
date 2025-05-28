import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
const rol = localStorage.getItem('rol');

 
export const getIpAndLocation = async () => {
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();

        const locationRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationRes.json();
        return {
            ip: ipData.ip,
            location: locationData.city,
            region: locationData.region,
            success: true
        };
    } catch (error) {
        console.error('Error fetching IP or location:', error);
        return {
            error: 'Failed to fetch IP or location data',
            success: false
        };
    }
}
