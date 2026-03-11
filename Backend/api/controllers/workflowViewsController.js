const workflowViewsService = require('../services/workflowViewsService');
const { extraerUserId } = require('../middlewares/extractJWT');

const resolveUserId = req => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    return String(extraerUserId(token) || req.query.userId || req.body?.userId || 'default');
};

const handleViewError = (res, error, fallbackMessage) => {
    console.error('Workflow views error:', error);

    const statusCode = error.statusCode || (error.message && (error.message.includes('Mongo') || error.message.includes('connection') || error.message.includes('configured')) ? 503 : 500);
    res.status(statusCode).json({
        success: false,
        message: error.message || fallbackMessage
    });
};

const getAllViews = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : undefined;
        const views = await workflowViewsService.getViews(userId, { limit });

        res.json({
            success: true,
            count: views.length,
            views
        });
    } catch (error) {
        handleViewError(res, error, 'Failed to fetch views');
    }
};

const getViewStats = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const stats = await workflowViewsService.getViewStats(userId);
        res.json({ success: true, stats });
    } catch (error) {
        handleViewError(res, error, 'Failed to fetch view statistics');
    }
};

const getViewByName = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const view = await workflowViewsService.getViewByName(req.params.name, userId);

        if (!view) {
            return res.status(404).json({ success: false, message: 'View not found' });
        }

        res.json({ success: true, view });
    } catch (error) {
        handleViewError(res, error, 'Failed to fetch view');
    }
};

const createView = async (req, res) => {
    try {
        const { name, components, selectedMeteorData, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'View name is required' });
        }

        if (!Array.isArray(components)) {
            return res.status(400).json({ success: false, message: 'Components array is required' });
        }

        const view = await workflowViewsService.createView({
            name,
            components,
            selectedMeteorData,
            description,
            userId: resolveUserId(req)
        });

        res.status(201).json({
            success: true,
            message: 'View created successfully',
            view
        });
    } catch (error) {
        handleViewError(res, error, 'Failed to create view');
    }
};

const updateView = async (req, res) => {
    try {
        const updated = await workflowViewsService.updateView(req.params.id, req.body || {});
        res.json({ success: true, message: 'View updated successfully', view: updated });
    } catch (error) {
        handleViewError(res, error, 'Failed to update view');
    }
};

const deleteView = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const result = await workflowViewsService.deleteView(req.params.name, userId);
        res.json({ success: true, message: 'View deleted successfully', deletedName: result.deletedName });
    } catch (error) {
        handleViewError(res, error, 'Failed to delete view');
    }
};

const importViews = async (req, res) => {
    try {
        const { views } = req.body;

        if (!views || typeof views !== 'object') {
            return res.status(400).json({ success: false, message: 'Views object is required' });
        }

        const result = await workflowViewsService.importViews(views, resolveUserId(req));
        res.json({
            success: true,
            message: `Successfully imported ${result.imported} views`,
            imported: result.imported,
            errors: result.errors,
            views: result.views
        });
    } catch (error) {
        handleViewError(res, error, 'Failed to import views');
    }
};

const syncLocalStorageViews = async (req, res) => {
    try {
        const { localStorageViews } = req.body;

        if (!Array.isArray(localStorageViews)) {
            return res.status(400).json({ success: false, message: 'localStorageViews array is required' });
        }

        const result = await workflowViewsService.syncLocalStorageViews(localStorageViews, resolveUserId(req));
        res.json({
            success: true,
            message: `Successfully synced ${result.synced} views, ${result.skipped} already existed`,
            synced: result.synced,
            skipped: result.skipped
        });
    } catch (error) {
        handleViewError(res, error, 'Failed to sync localStorage views');
    }
};

module.exports = {
    getAllViews,
    getViewStats,
    getViewByName,
    createView,
    updateView,
    deleteView,
    importViews,
    syncLocalStorageViews
};
