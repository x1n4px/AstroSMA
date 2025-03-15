const jwt = require('jsonwebtoken');
require('dotenv').config(); // Asegúrate de que dotenv esté configurado

function extraerUserId(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null;
  }
}

module.exports = {
  extraerUserId,
};