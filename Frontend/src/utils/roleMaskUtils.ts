

// utils/roleMaskUtils.ts
export const QR_USER_ROL = '00000000';
export const BASIC_USER_ROL = '00000001';
export const ADMIN_USER_ROL = '10000000';

export const GEMINI_ERROR_CONTROL = 'azd112';

export const isNotQRUser = (mask: string): boolean => {
  return mask !== QR_USER_ROL;
};

export const isBasicUser = (mask: string): boolean => {
  return mask === BASIC_USER_ROL;
};

export const isAdminUser = (mask: string): boolean => {
  return mask === ADMIN_USER_ROL;
};
export const isBasicOrAdminUser = (mask: string): boolean => {
  return mask === BASIC_USER_ROL || mask === ADMIN_USER_ROL;
}
export const isQRUser = (mask: string): boolean => {
  return mask === QR_USER_ROL;
}

export const allUser = (mask: string): boolean => {
  return (
    mask === QR_USER_ROL ||
    mask === BASIC_USER_ROL ||
    mask === ADMIN_USER_ROL
  );
};

export const controlGeminiError = (error: string): boolean => {
  return error !== GEMINI_ERROR_CONTROL;
};


 