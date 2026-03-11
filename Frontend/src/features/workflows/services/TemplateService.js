import { API_ENDPOINTS, fetchApi } from '../config/api';
import { templates } from '../utils/templates';

class TemplateService {
    constructor() {
        this.templates = templates;
    }

    /**
     * Get all available templates
     */
    getTemplates() {
        return this.templates;
    }

    /**
     * Get a specific template by key
     */
    getTemplate(templateKey) {
        console.log('TemplateService.getTemplate called with templateKey:', templateKey);
        const template = this.templates[templateKey];
        if (!template) {
            console.error(`Template '${templateKey}' not found`);
        }
        return template;
    }

    /**
     * Fetch meteor data for template variables
     */
    async fetchMeteorData(meteorId, templateKey) {
        console.log('TemplateService.fetchMeteorData called with meteorId:', meteorId, 'templateKey:', templateKey);
        
        if (!meteorId) {
            console.warn('No meteor ID provided for template data fetching');
            return null;
        }

        const template = this.getTemplate(templateKey);
        if (!template) {
            console.error(`Template '${templateKey}' not found`);
            return null;
        }

        try {
            const data = {};
            const queryPromises = [];

            // Execute all required queries in parallel
            template.variables.forEach(variable => {
                const queryPromise = this.executeQuery(
                    variable.query, 
                    meteorId, 
                    API_ENDPOINTS.workflows.runQuery
                ).then(result => {
                    if (variable.field) {
                        // For queries that return objects, extract specific field
                        data[variable.name] = this.extractFieldValue(result, variable.field);
                    } else {
                        // For queries that return simple values
                        data[variable.name] = result;
                    }
                }).catch(error => {
                    console.error(`Error fetching data for variable '${variable.name}':`, error);
                    data[variable.name] = null; // Let the template processing handle the display
                });

                queryPromises.push(queryPromise);
            });

            await Promise.all(queryPromises);
            return data;
        } catch (error) {
            console.error('Error fetching meteor data for template:', error);
            return null;
        }
    }

    /**
     * Execute a query using the existing query system
     */
    async executeQuery(queryName, meteorId, apiEndpoint) {
        try {
            // Use runPredefinedQuery endpoint with query name and meteorId as parameters
            const url = `${API_ENDPOINTS.workflows.runPredefinedQuery}?query=${queryName}&meteorId=${meteorId}`;
            
            const response = await fetchApi(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Error executing query '${queryName}':`, error);
            throw error;
        }
    }

    /**
     * Extract field value from query result
     */
    extractFieldValue(result, field) {
        if (!result || !Array.isArray(result) || result.length === 0) {
            return null;
        }

        // For single record queries, get the first record
        const record = result[0];
        if (!record || !record.hasOwnProperty(field)) {
            return null;
        }
        
        const value = record[field];
        // Return null for empty strings, null, or undefined values
        if (value === null || value === undefined || value === '') {
            return null;
        }
        
        return value;
    }

    /**
     * Process a template with provided data
     */
    processTemplate(templateKey, data) {
        console.log('TemplateService.processTemplate called with templateKey:', templateKey, 'data:', data);
        const template = this.getTemplate(templateKey);
        if (!template) {
            console.error(`Template '${templateKey}' not found`);
            return 'Template not found';
        }

        let processedText = template.template;
        
        // Replace variables with data
        template.variables.forEach(variable => {
            let value = data[variable.name];
            
            // Handle missing data more gracefully for any variable
            if (value === null || value === undefined || value === '[error]' || value === '') {
                value = 'no disponible';
            }
            
            const regex = new RegExp(`\\$\\{${variable.name}\\}`, 'g');
            processedText = processedText.replace(regex, value);
        });

        return processedText;
    }

    /**
     * Process template with meteor data
     */
    async processTemplateWithMeteorData(templateKey, meteorId) {
        console.log('TemplateService.processTemplateWithMeteorData called with templateKey:', templateKey, 'meteorId:', meteorId);
        
        const data = await this.fetchMeteorData(meteorId, templateKey);
        if (!data) {
            return `[Warning: No meteor data available for ID ${meteorId}]`;
        }

        return this.processTemplate(templateKey, data);
    }

    /**
     * Get template preview with sample data
     */
    getTemplatePreview(templateKey) {
        const sampleData = {
            hour: '02:05',
            date: '2023-01-15',
            stations: 'Segorbe (UMA/SMA/J.Castellano), Masquefa (UMA/SMA/E.Reina), Aras de los Olmos (UMA/SMA/BigHistory/Ayto. de Aras de los Olmos)',
            max_mag: '-3.2',
            min_mag: '1.8',
            mass: '0.045'
        };

        return this.processTemplate(templateKey, sampleData);
    }
}

const templateService = new TemplateService();
export default templateService;
