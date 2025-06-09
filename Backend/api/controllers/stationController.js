const pool = require('../database/connection');
const { transform } = require('../middlewares/convertSexagesimalToDecimal');
const { extraerUserId } = require('../middlewares/extractJWT')

/*
const stations = [
    {
        id: 0, lat: 39.0742, lon: -6.3996, title: 'Estación Sierra de Fuentes (Cáceres)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 1, lat: 36.1408, lon: -5.4613, title: 'Estación Green Globe (Algeciras, Cádiz)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 2, lat: 37.8882, lon: -4.7794, title: 'Estación El Viso (Córdoba)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 3, lat: 42.3406, lon: -3.7026, title: 'Estación Valpuesta (Burgos)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 4, lat: 40.6333, lon: -1.6167, title: 'Estación Villaverde del Ducado (Guadalajara)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 5, lat: 43.3667, lon: -6.25, title: 'Estación Muñás de Arriba (Asturias)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 6, lat: 41.5333, lon: 2.4419, title: 'Estación Mataró (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 7, lat: 41.5400, lon: 2.3050, title: 'Estación Cabrils (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 8, lat: 41.5500, lon: 1.8222, title: 'Estación Masquefa (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 9, lat: 28.9634, lon: -13.5416, title: 'Estación Nazaret (Lanzarote)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 10, lat: 36.7213, lon: -4.4214, title: 'Estación Málaga', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 11, lat: 39.7500, lon: -0.4167, title: 'Estación Segorbe (Castellón)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 12, lat: 28.5000, lon: -13.8667, title: 'Estación Puerto del Rosario (Fuerteventura)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 13, lat: 41.6167, lon: 1.8333, title: 'Estación San Martí de Sesgueioles (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 14, lat: 41.5333, lon: 2.0333, title: 'Estación Rubí (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 15, lat: 41.5400, lon: 2.4419, title: 'Estación COSMOS-Mataró (Barcelona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 16, lat: 36.7200, lon: -4.5000, title: 'Estación Coín (Málaga)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 17, lat: 38.3450, lon: -0.4833, title: 'Estación Alicante', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 18, lat: 39.7167, lon: -1.1667, title: 'Estación Aras de los Olmos (Valencia)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 19, lat: 41.9833, lon: 2.8167, title: 'Estación Sant Gregori (Girona)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 20, lat: 39.7000, lon: 2.9000, title: 'Estación Consell (Mallorca)', state: 0, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 21, lat: 40.8000, lon: -4.1000, title: 'Estación El Espinar (Segovia)', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 22, lat: 41.6667, lon: -4.9000, title: 'Estación Boecillo (Valladolid)', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 23, lat: 40.6167, lon: -2.9167, title: 'Estación El Cuartillejo (Guadalajara)', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 24, lat: 40.3333, lon: -1.3000, title: 'Estación Vegas del Codorno', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 25, lat: 43.4636, lon: -3.4292, title: 'Estación Santoña', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 26, lat: 42.4667, lon: 2.0167, title: 'Estación Bolvir (Girona)', state: 1, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 27, lat: 37.0667, lon: -6.7333, title: 'Observatorio BOOTES-1 (Mazagón, Huelva)', state: 2, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 28, lat: 36.7000, lon: -4.0000, title: 'Observatorio BOOTES-2 (Algarrobo, Málaga)', state: 2, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 29, lat: -45.8000, lon: 169.2167, title: 'Observatorio BOOTES-3 (Lauder, Nueva Zelanda)', state: 2, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 30, lat: 31.6000, lon: -115.4500, title: 'Observatorio BOOTES-5 (San Pedro Mártir, México)', state: 2, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 31, lat: -29.7456, lon: 26.6870, title: 'Observatorio BOOTES-6 (Boyden, Sudáfrica)', state: 2, img: 'station/obs_el_torcal.webp'
    },
    {
        id: 32, lat: -22.9200, lon: -68.2000, title: 'Observatorio BOOTES-7 (San Pedro de Atacama, Chile)', state: 2, img: 'station/obs_el_torcal.webp'
    }
];
*/


// Función para obtener un empleado por su ID
const getAllStations = async (req, res) => {
    try {
        const token = req.header('x-token');
        const userId = extraerUserId(token);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        // Verificar si el usuario tiene el rol adecuado
        const [userRows] = await pool.query(
            'SELECT rol FROM user WHERE id = ?',
            [userId]
        );
        let stations = [];
        if (userRows[0]?.rol === '10000000') { 
            stations = await pool.query('SELECT * FROM Observatorio ORDER BY Activo ASC');
        } else {
            stations = await pool.query('SELECT * FROM Observatorio WHERE Activo = 1 ORDER BY Activo ASC');
        }
        const convertedStations = transform(stations[0]);

        return res.json(convertedStations);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const getNearbyStations = async (req, res) => {
    try {
        const { lat, lon, radius } = req.query;
        const [stations] = await pool.query('SELECT * FROM Observatorio');

        return res.json(findStationsInRange(stations, lat, lon, radius));
    } catch (error) {
        console.error('Error al obtener la estación:', error);
        throw error;
    }
};

const getAsocciatedStations = async (req, res) => {
    try {
        const { id } = req.query;
        const arrayAleatorio = stations.sort(() => Math.random() - 0.5);
        const associatedStations = arrayAleatorio.slice(0, 2);
        return res.json(associatedStations);

    } catch (error) {
        console.error('Error al obtener la estación:', error);
        throw error;
    }
}


function findStationsInRange(stations, refLat, refLon, radiusKm) {
    const EARTH_RADIUS_KM = 6371; // Radio de la Tierra en kilómetros

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = degreesToRadians(lat2 - lat1);
        const dLon = degreesToRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    return stations.filter(station => {
        const distance = calculateDistance(refLat, refLon, station.lat, station.lon);
        return distance <= radiusKm;
    });
}


const updateStationStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(`UPDATE Observatorio SET Activo = CASE WHEN Activo = '0' THEN '1' ELSE '0' END WHERE Número = ?;`, [ id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        return res.json({ message: 'Station status updated successfully' });
    } catch (error) {
        console.error('Error updating station status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};





module.exports = {
    getAllStations,
    getNearbyStations,
    getAsocciatedStations,
    updateStationStatus
};
