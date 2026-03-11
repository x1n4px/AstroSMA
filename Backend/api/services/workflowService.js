const pool = require('../database/connection');
const { queries } = require('../utils/workflowQueries');
const WordPressClient = require('../utils/wordpressClient');

const WORDPRESS_CONFIG = {
    baseUrl: process.env.WORDPRESS_BASE_URL || 'https://meteoros.astromalaga.es',
    username: process.env.WORDPRESS_USERNAME || '',
    password: process.env.WORDPRESS_PASSWORD || '',
    defaultAuthor: process.env.WORDPRESS_DEFAULT_AUTHOR || '',
    defaultStatus: process.env.WORDPRESS_DEFAULT_STATUS || 'draft',
    defaultCategory: process.env.WORDPRESS_DEFAULT_CATEGORY || '',
    defaultTags: process.env.WORDPRESS_DEFAULT_TAGS ? process.env.WORDPRESS_DEFAULT_TAGS.split(',') : ['AstroSMA', 'Workflows', 'Meteoros'],
    enabled: process.env.WORDPRESS_ENABLED !== 'false',
    timeout: Number.parseInt(process.env.WORDPRESS_TIMEOUT, 10) || 30000
};

const unresolvedPlaceholderPattern = /\$\{([^}]+)\}/g;

const sanitizeQueryParam = value => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).replace(/'/g, "''");
};

const applyQueryTemplate = (template, params = {}) => {
    const compiled = template.replace(unresolvedPlaceholderPattern, (_, paramName) => {
        if (!(paramName in params)) {
            return `__MISSING_PARAM__${paramName}__`;
        }

        return sanitizeQueryParam(params[paramName]);
    });

    const missingParams = [...compiled.matchAll(/__MISSING_PARAM__(.+?)__/g)].map(match => match[1]);

    if (missingParams.length > 0) {
        const uniqueMissing = [...new Set(missingParams)].join(', ');
        throw Object.assign(new Error(`Missing required workflow parameter(s): ${uniqueMissing}`), { statusCode: 400 });
    }

    return compiled;
};

const validateWordPressConfig = () => {
    const errors = [];

    if (!WORDPRESS_CONFIG.enabled) {
        return { valid: false, errors: ['WordPress integration is disabled'] };
    }

    if (!WORDPRESS_CONFIG.username) {
        errors.push('WORDPRESS_USERNAME is required');
    }

    if (!WORDPRESS_CONFIG.password) {
        errors.push('WORDPRESS_PASSWORD is required');
    }

    if (!WORDPRESS_CONFIG.baseUrl) {
        errors.push('WORDPRESS_BASE_URL is required');
    }

    return { valid: errors.length === 0, errors };
};

const getWordPressClient = () => new WordPressClient(
    WORDPRESS_CONFIG.baseUrl,
    WORDPRESS_CONFIG.username,
    WORDPRESS_CONFIG.password,
    WORDPRESS_CONFIG.timeout
);

const runQuery = async sql => {
    const [rows] = await pool.query(sql);
    return rows;
};

const runPredefinedQuery = async (queryName, params = {}) => {
    const queryTemplate = queries[queryName];

    if (!queryTemplate) {
        throw Object.assign(new Error(`Query not found: ${queryName}`), { statusCode: 404 });
    }

    const sql = applyQueryTemplate(queryTemplate, params);
    return runQuery(sql);
};

const publishToWordPress = async ({ title, content, author, categories, tags, excerpt, status }) => {
    const configValidation = validateWordPressConfig();
    if (!configValidation.valid) {
        return {
            success: false,
            error: 'WordPress configuration error',
            errors: configValidation.errors
        };
    }

    const client = getWordPressClient();
    const formattedContent = client.formatContentForWordPress(content);

    const result = await client.createPost({
        title,
        content: formattedContent,
        author: author || WORDPRESS_CONFIG.defaultAuthor,
        categories: categories || (WORDPRESS_CONFIG.defaultCategory ? [WORDPRESS_CONFIG.defaultCategory] : []),
        tags: tags || WORDPRESS_CONFIG.defaultTags,
        excerpt: excerpt || `Informe generado por AstroSMA Workflows el ${new Date().toLocaleDateString()}`,
        status: status || WORDPRESS_CONFIG.defaultStatus
    });

    return result;
};

const checkWordPressConnection = async () => {
    const configValidation = validateWordPressConfig();
    if (!configValidation.valid) {
        return {
            success: false,
            error: 'WordPress configuration error',
            errors: configValidation.errors,
            config: {
                enabled: WORDPRESS_CONFIG.enabled,
                baseUrl: WORDPRESS_CONFIG.baseUrl,
                hasUsername: Boolean(WORDPRESS_CONFIG.username),
                hasPassword: Boolean(WORDPRESS_CONFIG.password),
                defaultAuthor: WORDPRESS_CONFIG.defaultAuthor,
                defaultStatus: WORDPRESS_CONFIG.defaultStatus
            }
        };
    }

    const client = getWordPressClient();
    const authenticated = await client.authenticate();

    if (!authenticated) {
        return {
            success: false,
            error: 'WordPress authentication failed'
        };
    }

    return {
        success: true,
        config: {
            baseUrl: WORDPRESS_CONFIG.baseUrl,
            defaultAuthor: WORDPRESS_CONFIG.defaultAuthor,
            defaultStatus: WORDPRESS_CONFIG.defaultStatus,
            defaultTags: WORDPRESS_CONFIG.defaultTags,
            timeout: WORDPRESS_CONFIG.timeout
        }
    };
};

module.exports = {
    runQuery,
    runPredefinedQuery,
    publishToWordPress,
    checkWordPressConnection
};
