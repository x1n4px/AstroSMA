import axios from 'axios';
import { stringify } from "flatted";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const iaModel = import.meta.env.VITE_GEMINI_MODEL;
const language = localStorage.getItem('i18nextLng') || 'es';

export const GeminiEndpoint = async (data, observatory, orbitalElement) => {
    const tx2 = `
    Dado el texto de ejemplo: 
    A las 20:19 del 31 de enero ha sido detectado un bólido por las estaciones de Masquefa (UMA/SMA/E.Reina), Mataró (UMA/SMA/J.Lopesino), Segorbe (UMA/SMA/J.Castellano) Y Sant Martí de Sesgueioles (UMA/SMA/F.Grau), integradas en la Red UMA/SMA.
    El meteoroide comenzó sobre el Mediterráneo, al noreste de la isla de Mallorca. a 75Km de altitud. Recorrió 36 Km en dirección sureste a una velocidad de 67.320Km/h y se desintegró en el interior a una altura de 50Km. (Mapa en portada.)
    La órbita de procedencia tenía una inclinación de 24º.18, semieje mayor a=1.78U.S y excentricidad e=0.44.

    Es importantisimo que si los datos de entrada son incoherentes con datos propios de bólidos, se notifique claramente en el texto generado (indicalo en la cabecera). No hay que notificar si no hay datos incoherentes, solo si los hay. Es importante que no generes un aviso si la excentricidad de la órbita es hiperbólica, ya que esto no es un error, es un dato correcto.
    Genera un texto similar al anterior, pero con los datos de entrada que te he proporcionado.
    Datos de entrada:
    Fecha: ${data.Fecha}
    Hora: ${data.Hora}
    Observatorios: ${JSON.stringify(observatory)}
    cada uno de los siguiente datos posee su latitud, longitud, distancia y altitud:
        Inicio de la trayectoria medida por el primer observatorio: ${JSON.stringify(data.Inicio_de_la_trayectoria_Estacion_1)}
        Fin de la trayectoria medida por el primer observatorio: ${JSON.stringify(data.Fin_de_la_trayectoria_Estacion_1)}
        Inicio de la trayectoria medida por el segundo observatorio: ${JSON.stringify(data.Inicio_de_la_trayectoria_Estacion_2)}
        Fin de la trayectoria medida por el segundo observatorio: ${JSON.stringify(data.Fin_de_la_trayectoria_Estacion_2)}
    Los datos de la órbita son: ${JSON.stringify(orbitalElement)}

    Además, aquí tienes el reporte completo, no para mostrarlo, solo para que lo revises y lo uses como referencia: ${JSON.stringify(data)}

    Genera un texto similar al anterior, ya que es para una web de astronomía, hazlo en formato html, no generes tablas de ningún tipo, solo texto. Necesito que cada vez que marques una posicion gps indiques cerca de que ciudad se encuentra (es muy importante que esto sea correcto). Los datos orbitales están para que los muestres, además indiques que tipo de órbita tienen.
    Asegúrate de que el texto generado tenga formato html. El lenguaje del texto generado es ${language}.`;

 

    try {
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${iaModel}:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [{ text: tx2 }],
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return geminiResponse.data; // Devuelve solo los datos de la respuesta
    } catch (error) {
        throw error;
    }
};