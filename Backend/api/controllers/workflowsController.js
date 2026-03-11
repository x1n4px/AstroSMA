const workflowService = require('../services/workflowService');

const check = async (req, res) => {
    res.json({ success: true, message: 'AstroSMA workflows service is running' });
};

const runQuery = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Missing required parameter: query' });
    }

    try {
        const result = await workflowService.runQuery(query);
        res.json(result);
    } catch (error) {
        console.error('Workflow runQuery error:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Failed to execute query' });
    }
};

const runPredefinedQuery = async (req, res) => {
    const { query, ...params } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Missing required parameter: query' });
    }

    try {
        const result = await workflowService.runPredefinedQuery(query, params);
        res.json(result);
    } catch (error) {
        console.error('Workflow runPredefinedQuery error:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Failed to execute predefined query' });
    }
};

const publishToWordPress = async (req, res) => {
    const { title, content, author, categories, tags, excerpt, status } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const result = await workflowService.publishToWordPress({ title, content, author, categories, tags, excerpt, status });

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to create WordPress post',
                errors: result.errors || []
            });
        }

        res.json({
            success: true,
            message: 'Post created successfully',
            postId: result.postId,
            postUrl: result.postUrl,
            editUrl: result.editUrl
        });
    } catch (error) {
        console.error('Workflow publishToWordPress error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to publish to WordPress' });
    }
};

const checkWordPressStatus = async (req, res) => {
    try {
        const result = await workflowService.checkWordPressConnection();

        if (!result.success) {
            return res.status(401).json(result);
        }

        res.json({
            success: true,
            message: 'WordPress connection successful',
            config: result.config
        });
    } catch (error) {
        console.error('Workflow checkWordPressStatus error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to check WordPress connection' });
    }
};

module.exports = {
    check,
    runQuery,
    runPredefinedQuery,
    publishToWordPress,
    checkWordPressStatus
};
