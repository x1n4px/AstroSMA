export const getIpAndLocation = async () => {
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();

        return {
            ip: ipData.ip,
            location: null,
            region: null,
            success: true
        };
    } catch (error) {
        return {
            error: 'Failed to fetch IP or location data',
            success: false
        };
    }
}
