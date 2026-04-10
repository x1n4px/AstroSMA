const jwt = require('jsonwebtoken');

require('dotenv').config(); // Asegúrate de que dotenv esté configurado

function normalizeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  return token.replace(/^Bearer\s+/i, '').trim() || null;
}

function resolveJwtUserId(decoded) {
  if (!decoded || typeof decoded !== 'object') {
    return null;
  }

  const candidate =
    decoded.userId ??
    decoded.uid ??
    decoded.id ??
    decoded.user_id ??
    decoded?.user?.id ??
    decoded?.data?.userId ??
    decoded?.data?.uid ??
    null;

  if (candidate === null || candidate === undefined || candidate === '') {
    return null;
  }

  const parsed = Number(candidate);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function extraerUserId(token) {
  try {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
      return null;
    }

    const decoded = jwt.verify(normalizedToken, process.env.JWT_SECRET);
    return resolveJwtUserId(decoded);
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null;
  }
}

 

module.exports = {
  normalizeToken,
  resolveJwtUserId,
  extraerUserId,
};
