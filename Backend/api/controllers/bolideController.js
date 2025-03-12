const { pool } = require('../database/connection');


const data = [
  {
    id: 1,
    lat: 40.4168,
    lon: -3.7038,
    title: 'Punto 1 (Madrid)',
    date: 'Tue Oct 27 2020 10:15:23 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 396
  },
  {
    id: 2,
    lat: 41.3851,
    lon: 2.1734,
    title: 'Punto 2 (Barcelona)',
    date: 'Wed Mar 15 2017 14:28:57 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 409
  },
  {
    id: 3,
    lat: 39.4624,
    lon: -0.376,
    title: 'Punto 3 (Valencia)',
    date: 'Thu Dec 05 2019 08:42:12 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 177
  },
  {
    id: 4,
    lat: 37.3891,
    lon: -5.9845,
    title: 'Punto 4 (Sevilla)',
    date: 'Fri Aug 21 2015 17:56:48 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 408
  },
  {
    id: 5,
    lat: 43.3603,
    lon: -5.8448,
    title: 'Punto 5 (Oviedo)',
    date: 'Sat Jun 08 2024 12:30:05 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 367
  },
  {
    id: 6,
    lat: 36.7202,
    lon: -4.4203,
    title: 'Punto 6 (Málaga)',
    date: 'Sun Apr 18 2021 21:10:32 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 433
  },
  {
    id: 7,
    lat: 38.3452,
    lon: -0.4815,
    title: 'Punto 7 (Alicante)',
    date: 'Mon Feb 29 2016 09:55:19 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 228
  },
  {
    id: 8,
    lat: 42.8783,
    lon: -1.6463,
    title: 'Punto 8 (Pamplona)',
    date: 'Tue Sep 10 2018 16:03:41 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 491
  },
  {
    id: 9,
    lat: 43.263,
    lon: -2.935,
    title: 'Punto 9 (Bilbao)',
    date: 'Wed Jul 01 2020 11:22:08 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 391
  },
  {
    id: 10,
    lat: 37.1772,
    lon: -3.5986,
    title: 'Punto 10 (Granada)',
    date: 'Thu Nov 26 2015 19:47:35 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 238
  },
  {
    id: 11,
    lat: 43.5321,
    lon: -5.6618,
    title: 'Punto 11 (Gijón)',
    date: 'Fri May 12 2023 13:18:50 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 139
  },
  {
    id: 12,
    lat: 39.8629,
    lon: -4.024,
    title: 'Punto 12 (Toledo)',
    date: 'Sat Jan 02 2016 07:33:27 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 260
  },
  {
    id: 13,
    lat: 39.0992,
    lon: -6.8048,
    title: 'Punto 13 (Cáceres)',
    date: 'Sun Aug 09 2020 20:01:14 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 50
  },
  {
    id: 14,
    lat: 41.6561,
    lon: -4.7245,
    title: 'Punto 14 (Valladolid)',
    date: 'Mon Mar 22 2021 15:45:59 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 267
  },
  {
    id: 15,
    lat: 42.4668,
    lon: -2.4458,
    title: 'Punto 15 (Logroño)',
    date: 'Tue Dec 15 2017 11:09:22 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 42
  },
  {
    id: 16,
    lat: 38.9047,
    lon: -7.009,
    title: 'Punto 16 (Badajoz)',
    date: 'Wed Jul 24 2019 18:27:03 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 224
  },
  {
    id: 17,
    lat: 42.2351,
    lon: -8.7111,
    title: 'Punto 17 (Vigo)',
    date: 'Thu Jun 04 2020 09:14:46 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 410
  },
  {
    id: 18,
    lat: 36.5298,
    lon: -6.2929,
    title: 'Punto 18 (Cádiz)',
    date: 'Fri Apr 09 2021 16:39:18 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 274
  },
  {
    id: 19,
    lat: 43.0039,
    lon: -7.5501,
    title: 'Punto 19 (Lugo)',
    date: 'Sat Feb 13 2016 12:06:53 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 49
  },
  {
    id: 20,
    lat: 40.7548,
    lon: -6.6022,
    title: 'Punto 20 (Salamanca)',
    date: 'Sun Sep 27 2020 20:50:37 GMT+0200 (Central European Summer Time)',
    video: '',
    height: 459
  },
  {
    id: 21,
    lat: 51.5074,
    lon: -0.1278,
    title: 'Punto 21 (Londres, UK)',
    date: 'Tue Jan 13 2025 12:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 23
  },
  {
    id: 22,
    lat: 40.7128,
    lon: -74.006,
    title: 'Punto 22 (Nueva York, USA)',
    date: 'Thu Feb 20 2025 09:30:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 49
  },
  {
    id: 23,
    lat: -33.8688,
    lon: 151.2093,
    title: 'Punto 23 (Sídney, Australia)',
    date: 'Wed Mar 12 2025 14:10:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 87
  },
  {
    id: 24,
    lat: 48.8566,
    lon: 2.3522,
    title: 'Punto 24 (París, Francia)',
    date: 'Fri Apr 10 2025 10:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 107
  },
  {
    id: 25,
    lat: 35.6762,
    lon: 139.6503,
    title: 'Punto 25 (Tokio, Japón)',
    date: 'Thu Feb 27 2025 06:30:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 188
  },
  {
    id: 26,
    lat: -22.9068,
    lon: -43.1729,
    title: 'Punto 26 (Río de Janeiro, Brasil)',
    date: 'Mon Apr 06 2025 18:20:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 69
  },
  {
    id: 27,
    lat: 39.9042,
    lon: 116.4074,
    title: 'Punto 27 (Pekín, China)',
    date: 'Tue Mar 03 2025 13:40:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 58
  },
  {
    id: 28,
    lat: -34.6037,
    lon: -58.3816,
    title: 'Punto 28 (Buenos Aires, Argentina)',
    date: 'Sat Feb 15 2025 09:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 476
  },
  {
    id: 29,
    lat: 55.7558,
    lon: 37.6173,
    title: 'Punto 29 (Moscú, Rusia)',
    date: 'Fri Jan 24 2025 22:30:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 188
  },
  {
    id: 30,
    lat: -34.9285,
    lon: 138.6007,
    title: 'Punto 30 (Adelaida, Australia)',
    date: 'Tue Feb 17 2025 15:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 62
  },
  {
    id: 31,
    lat: 40.7306,
    lon: -73.9352,
    title: 'Punto 31 (Brooklyn, USA)',
    date: 'Mon Mar 09 2025 08:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 493
  },
  {
    id: 32,
    lat: 34.0522,
    lon: -118.2437,
    title: 'Punto 32 (Los Ángeles, USA)',
    date: 'Thu Feb 06 2025 12:45:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 374
  },
  {
    id: 33,
    lat: 51.1657,
    lon: 10.4515,
    title: 'Punto 33 (Alemania)',
    date: 'Tue Feb 04 2025 14:20:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 278
  },
  {
    id: 34,
    lat: 37.9838,
    lon: 23.7275,
    title: 'Punto 34 (Atenas, Grecia)',
    date: 'Fri Jan 31 2025 18:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 364
  },
  {
    id: 35,
    lat: 40.7488,
    lon: -73.9857,
    title: 'Punto 35 (Empire State, Nueva York, USA)',
    date: 'Sat Mar 14 2025 16:20:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 84
  },
  {
    id: 36,
    lat: -33.4489,
    lon: -70.6693,
    title: 'Punto 36 (Santiago, Chile)',
    date: 'Thu Mar 19 2025 11:00:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 137
  },
  {
    id: 37,
    lat: 55.9533,
    lon: -3.1883,
    title: 'Punto 37 (Edimburgo, Escocia)',
    date: 'Tue Feb 11 2025 17:50:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 94
  },
  {
    id: 38,
    lat: 40.7484,
    lon: -73.9857,
    title: 'Punto 38 (Times Square, Nueva York, USA)',
    date: 'Mon Jan 27 2025 22:15:00 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 460
  },
  {
    id: 39,
    lat: 36.7909,
    lon: -4.5599,
    title: 'Punto 39 (Cártama)',
    date: 'Sun Jan 05 2025 14:52:19 GMT+0100 (Central European Standard Time)',
    height: 312
  },
  {
    id: 40,
    lat: 36.6257,
    lon: -4.4452,
    title: 'Punto 40 (Málaga)',
    date: 'Fri Mar 07 2025 06:24:02 GMT+0100 (Central European Standard Time)',
    height: 454
  },
  {
    id: 41,
    lat: 36.7324,
    lon: -4.7205,
    title: 'Punto 41 (Mijas)',
    date: 'Sun Nov 17 2024 14:41:10 GMT+0100 (Central European Standard Time)',
    height: 414
  },
  {
    id: 42,
    lat: 36.7932,
    lon: -4.6821,
    title: 'Punto 42 (Benalmádena)',
    date: 'Tue Jan 07 2025 23:34:39 GMT+0100 (Central European Standard Time)',
    video: '',
    height: 241
  },
  {
    id: 43,
    lat: 36.5533,
    lon: -4.5759,
    title: 'Punto 43 (Coín)',
    date: 'Wed Sep 18 2024 03:36:42 GMT+0200 (Central European Summer Time)',
    height: 450
  },
  {
    id: 44,
    lat: 36.6294,
    lon: -4.6482,
    title: 'Punto 44 (Marbella)',
    date: 'Wed Feb 26 2025 11:56:08 GMT+0100 (Central European Standard Time)',
    height: 296
  },
  {
    id: 45,
    lat: 36.6679,
    lon: -4.7072,
    title: 'Punto 45 (Torremolinos)',
    date: 'Tue Oct 15 2024 12:57:03 GMT+0200 (Central European Summer Time)',
    height: 412
  },
  {
    id: 46,
    lat: 36.6499,
    lon: -4.5063,
    title: 'Punto 46 (Ronda)',
    date: 'Tue Dec 03 2024 12:14:36 GMT+0100 (Central European Standard Time)',
    height: 452
  },
  {
    id: 47,
    lat: 36.7736,
    lon: -4.4365,
    title: 'Punto 47 (Málaga)',
    date: 'Sun Feb 09 2025 05:59:42 GMT+0100 (Central European Standard Time)',
    height: 431
  },
  {
    id: 48,
    lat: 36.7484,
    lon: -4.4832,
    title: 'Punto 48 (Málaga)',
    date: 'Sun Sep 15 2024 04:41:55 GMT+0200 (Central European Summer Time)',
    height: 306
  },
  {
    id: 49,
    lat: 36.7632,
    lon: -4.5679,
    title: 'Punto 49 (Fuengirola)',
    date: 'Mon Sep 09 2024 00:23:54 GMT+0200 (Central European Summer Time)',
    height: 395
  },
  {
    id: 50,
    lat: 41.577591,
    lon: 2.443787,
    title: 'Punto 50 (Mataró)',
    date: 'Sun Jan 26 2025 22:25:47 GMT+0100 (Central European Standard Time)',
    height: 482
  }
]



const meteoros = [
    { "id": 1, "nombre": 'Bólido A', "a": 2.5, "e": 0.7, "i": 15, "Omega": 45, "w": 20 },
    { "id": 2, "nombre": 'Bólido B', "a": 3.2, "e": 0.5, "i": 10, "Omega": 60, "w": 40 },
    { "id": 3, "nombre": 'Bólido C', "a": 7.2, "e": 1.5, "i": 40, "Omega": 70, "w": 40 }
];
// Función para obtener un empleado por su ID
const getAllBolide = async (req, res) => {
    try {
        // Retornar la tienda encontrada
        return res.json(data);
    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        throw error;
    }
};

// Función para filtrar datos de los últimos 6 meses
const filterRecentData = (data) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // Obtenemos la fecha de hace 6 meses

    return data.filter(item => new Date(item.date) >= sixMonthsAgo);
};

const getAllBolideLastSixMonths = async (req, res) => {
    try {
        const filteredData = filterRecentData(data);

        // Obtener los 6 meses más recientes
        const currentMonth = new Date().getMonth(); // Obtener el mes actual
        const monthsRange = Array.from({ length: 6 }, (_, index) => (currentMonth - index + 12) % 12); // Calculamos los últimos 6 meses

        // Los meses deben ordenarse de octubre a marzo
        const sortedMonthsRange = monthsRange.reverse();  // Revertir el orden para empezar por octubre

        // Agrupar por mes y contar registros
        const monthlyCounts = filteredData.reduce((acc, item) => {
            const month = new Date(item.date).getMonth(); // Asegúrate de que 'date' es el campo que contiene la fecha
            if (sortedMonthsRange.includes(month)) {
                if (!acc[month]) {
                    acc[month] = 1;
                } else {
                    acc[month]++;
                }
            }
            return acc;
        }, {});

        // Crear el array con 0 en los meses que no tienen registros
        const monthlyCountsArray = sortedMonthsRange.map(month => ({
            month: month,
            count: monthlyCounts[month] || 0
        }));

        // Devolver la respuesta con la data filtrada y el nuevo array de conteo por mes
        res.json({
            filteredData,
            monthlyCounts: monthlyCountsArray
        });
    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        throw error;
    }
};





const getBolideById = async (req, res) => {
    try {
        const id = req.params.id;
        const bolide = data.find(item => item.id == id);
        return res.json(bolide);
    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        throw error;
    }
};




const getBolideCompareLastTen = async (req, res) => {
    try {
        const bolidesLimitados = meteoros.length > 10 ? meteoros.slice(-10) : meteoros;

        return res.json(bolidesLimitados);
    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        throw error;
    }
};

const getBolideCompareLastTwo = async (req, res) => {
    try {
        return res.json(meteoros.slice(-2));
    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        throw error;
    }
};

/*
{
        "id": 1,
        "lat": 40.4168,
        "lon": -3.7038,
        "title": "Punto 1 (Madrid)",
        "date": "Tue Oct 27 2020 10:15:23 GMT+0100 (Central European Standard Time)",
        "video": "",
        "height":80
    }
*/

const getBolideWithCustomSearch = async (req, res) => {
    try {
        const { heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked } = req.query;
        let resultados = data; // Inicializamos con todos los datos

        // Filtrar por altura
        if (JSON.parse(heightChecked) && heightFilter) {
            resultados = resultados.filter(item => item.height <= parseFloat(heightFilter));
        }

        // Filtrar por latitud y longitud
        if (latLonChecked && JSON.parse(latLonChecked) && latFilter && lonFilter && ratioFilter) {
            const centroLat = parseFloat(latFilter);
            const centroLon = parseFloat(lonFilter);
            const radio = parseFloat(ratioFilter);

            resultados = resultados.filter(item => {
                const distancia = calcularDistancia(centroLat, centroLon, item.lat, item.lon);
                return distancia <= radio;
            });

        }

        res.json(resultados);

    } catch (error) {
        console.error('Error al obtener los bolidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Función para calcular la distancia entre dos puntos (en kilómetros)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const radioTierra = 6371; // Radio de la Tierra en kilómetros
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = radioTierra * c; // Distancia en kilómetros
    return distancia;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}



const testing = async (req, res) => {
  try {
    const [meteoros] = await pool.promise().query('select * from Meteoro');
    return res.json(meteoros);
  } catch (error) {
    console.error('Error al obtener los bolidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
  }
}


module.exports = {
    getAllBolide,
    getAllBolideLastSixMonths,
    getBolideById,
    getBolideCompareLastTen,
    getBolideCompareLastTwo,
    getBolideWithCustomSearch,
    testing
};
