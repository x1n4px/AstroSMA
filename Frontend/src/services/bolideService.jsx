import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


export const getAllBolide = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
};


export const getAllBolideLastSixMonths = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/months`);
        return response.data.filteredData;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
}

export const getAllBolideLastSixMonthsWithInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/months` );
        return response.data;
    } catch (error) {
        console.error('Error fetching bolides:', error);
        throw error;
    }
}




export const getBolideById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/${id}`);
        return [response.data];
    } catch (error) {
        console.error(`Error fetching bolides with ID: ${id}:`, error);
        throw error;
    }
}


export const getLastTenBolide = async () => {
    const response = await axios.get(`${API_URL}/bolide/comparation`);
    return response.data;
}

export const getLastTWoBolide = async () => {
    const response = await axios.get(`${API_URL}/bolide/comparation/two`);
    return response.data;
}

export const getBolideTrajectoriesForEarthGlobe = async ({ startDate, endDate } = {}) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/earth/trajectories`, {
            params: {
                startDate,
                endDate
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching 3D earth bolide trajectories:', error);
        throw error;
    }
}


export const getBolideWithCustomSearch = async ({
    heightFilter,
    latFilter,
    lonFilter,
    ratioFilter,
    heightChecked,
    latLonChecked,
    dateRangeChecked,
    startDate,
    endDate,
    actualPage,
    reportType,
    meteorIdFilter,
    observatoryFilter,
    showerFilter,
    minVelocityFilter,
    maxVelocityFilter,
    requireReportZ,
    requireReportRadiant,
    requireReportPhotometry,
    sortOrder,
    timeFrom,
    timeTo,
    minMagMaxFilter,
    maxMagMaxFilter,
    minMassFilter,
    maxMassFilter
}) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/search`, {
            params: {
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
                actualPage,
                reportType,
                meteorIdFilter,
                observatoryFilter,
                showerFilter,
                minVelocityFilter,
                maxVelocityFilter,
                requireReportZ,
                requireReportRadiant,
                requireReportPhotometry,
                sortOrder,
                timeFrom,
                timeTo,
                minMagMaxFilter,
                maxMagMaxFilter,
                minMassFilter,
                maxMassFilter
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

export const getCustomSearchCatalogs = async () => {
    try {
        const response = await axios.get(`${API_URL}/bolide/search/catalogs`);
        return response.data;
    } catch (error) {
        console.error('Error loading custom search catalogs:', error);
        throw error;
    }
};

export const getBolideWithCustomSearchCSV = async ({ heightFilter, latFilter, lonFilter, ratioFilter, heightChecked, latLonChecked, dateRangeChecked, startDate, endDate, actualPage, reportType }) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/search/csv`, {
            params: {
                heightFilter,
                latFilter,
                lonFilter,
                ratioFilter,
                heightChecked,
                latLonChecked,
                dateRangeChecked,
                startDate,
                endDate,
                actualPage,
                reportType
            },
            responseType: 'blob', // Indica que esperas un blob (archivo)
        });

        return response;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};
 

export const getReportData = async ({ IDs_Informe_Radiante, IDs_Informe_Fotometria, IDs_Informe_Z }) => {
    try {
        const response = await axios.get(`${API_URL}/bolide/search/reports`, {
            params: {
                IDs_Informe_Radiante,
                IDs_Informe_Fotometria,
                IDs_Informe_Z
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};
