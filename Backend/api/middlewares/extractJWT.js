const jwt = require('jsonwebtoken');

require('dotenv').config(); // Asegúrate de que dotenv esté configurado

function normalizeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  return token.replace(/^Bearer\s+/i, '').trim() || null;
}

function extraerUserId(token) {
  try {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
      return null;
    }

    const decoded = jwt.verify(normalizedToken, process.env.JWT_SECRET);
    return decoded.userId ?? decoded.uid ?? null;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null;
  }
}

 

module.exports = {
  normalizeToken,
  extraerUserId,
};
