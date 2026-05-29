import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getAdminBolides = async (filters) => {
    const response = await axios.get(`${apiUrl}/admin/bolides`, { params: filters });
    return response.data;
};

export const createAdminBolide = async (bolide) => {
    const response = await axios.post(`${apiUrl}/admin/bolides`, bolide);
    return response.data;
};

export const updateAdminBolide = async (id, bolide) => {
    const response = await axios.put(`${apiUrl}/admin/bolides/${id}`, bolide);
    return response.data;
};

export const deleteAdminBolide = async (id) => {
    const response = await axios.delete(`${apiUrl}/admin/bolides/${id}`);
    return response.data;
};

export const getAdminReportZ = async (filters) => {
    const response = await axios.get(`${apiUrl}/admin/reportz`, { params: filters });
    return response.data;
};

export const createAdminReportZ = async (report) => {
    const response = await axios.post(`${apiUrl}/admin/reportz`, report);
    return response.data;
};

export const updateAdminReportZ = async (id, report) => {
    const response = await axios.put(`${apiUrl}/admin/reportz/${id}`, report);
    return response.data;
};

export const deleteAdminReportZ = async (id) => {
    const response = await axios.delete(`${apiUrl}/admin/reportz/${id}`);
    return response.data;
};

export const getAdminScientificTable = async (tableKey, filters) => {
    const response = await axios.get(`${apiUrl}/admin/scientific-tables/${tableKey}`, { params: filters });
    return response.data;
};

export const createAdminScientificRow = async (tableKey, row) => {
    const response = await axios.post(`${apiUrl}/admin/scientific-tables/${tableKey}`, row);
    return response.data;
};

export const updateAdminScientificRow = async (tableKey, key, row) => {
    const response = await axios.put(`${apiUrl}/admin/scientific-tables/${tableKey}`, { key, row });
    return response.data;
};

export const deleteAdminScientificRow = async (tableKey, key) => {
    const response = await axios.delete(`${apiUrl}/admin/scientific-tables/${tableKey}`, { data: { key } });
    return response.data;
};
