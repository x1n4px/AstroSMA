import axios from 'axios';

const getSonificationApiBaseUrl = () => (
  import.meta.env.VITE_SONIFICATION_API_URL
  || import.meta.env.VITE_API_URL
  || (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

const apiUrl = getSonificationApiBaseUrl();

const buildSonificationUrl = (path) => {
  if (!path) {
    return apiUrl;
  }

  return `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getSonificationOverview = async (id) => {
  try {
    const response = await axios.get(buildSonificationUrl(`/reportz/${id}/sonification`));
    return response.data;
  } catch (error) {
    console.error('[sonificationService] getSonificationOverview failed:', error);
    throw error;
  }
};

export const getSonificationMethod = async (id, method) => {
  try {
    const response = await axios.get(buildSonificationUrl(`/reportz/${id}/sonification/${method}`));
    return response.data;
  } catch (error) {
    console.error('[sonificationService] getSonificationMethod failed:', error);
    throw error;
  }
};
