const { type } = require("os");

const QR_USER_ROL = '00000000';
const BASIC_USER_ROL = '00000001';
const ADMIN_USER_ROL = '10000000';

const GEMINI_ERROR_CONTROL = 'azd112';

const isNotQRUser = (mask) => {
  return mask !== QR_USER_ROL;
};

const isBasicUser = (mask) => {
  return mask === BASIC_USER_ROL;
};

const isAdminUser = (mask) => {
  return mask === ADMIN_USER_ROL;
};

const isBasicOrAdminUser = (mask) => {
  return mask === BASIC_USER_ROL || mask === ADMIN_USER_ROL;
};

const isQRUser = (mask) => {
  return mask === QR_USER_ROL;
};

const controlGeminiError = (error) => {
  return error !== GEMINI_ERROR_CONTROL;
};

module.exports = {
  QR_USER_ROL,
  BASIC_USER_ROL,
  ADMIN_USER_ROL,
  GEMINI_ERROR_CONTROL,
  isNotQRUser,
  isBasicUser,
  isAdminUser,
  isBasicOrAdminUser,
  isQRUser,
  controlGeminiError,
};
