const mysql = require('mysql2');
require('dotenv').config(); // Cargar variables de entorno

// Crear un pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Número máximo de conexiones simultáneas
    queueLimit: 0
}).promise(); // Habilitar promesas en el pool

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión establecida correctamente');
        connection.release(); // Liberar la conexión
    } catch (err) {
        console.error('❌ Error al conectar con MySQL:', err);
    }
}

// Ejecutar prueba de conexión
testConnection();

module.exports = pool; // Exportamos directamente el pool con soporte para async/await
