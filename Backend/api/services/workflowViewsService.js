const { getWorkflowViewModel } = require('../models/workflowViewModel');

const toSerializable = view => {
    if (!view) {
        return null;
    }

    return {
        ...view.toObject(),
        _id: String(view._id)
    };
};

const buildViewPayload = ({ name, components, selectedMeteorData, description, userId, syncedFromLocalStorage = false }) => ({
    name: name.trim(),
    components: Array.isArray(components) ? components : [],
    selectedMeteorData: selectedMeteorData || null,
    userId: userId || 'default',
    metadata: {
        componentCount: Array.isArray(components) ? components.length : 0,
        componentTypes: Array.isArray(components) ? [...new Set(components.map(component => component.type).filter(Boolean))] : [],
        description: description || '',
        syncedFromLocalStorage
    }
});

const getViews = async (userId = 'default', { limit } = {}) => {
    const WorkflowView = await getWorkflowViewModel();
    let query = WorkflowView.find({ userId }).sort({ createdAt: -1 });

    if (limit) {
        query = query.limit(limit);
    }

    const views = await query.exec();
    return views.map(toSerializable);
};

const getViewByName = async (name, userId = 'default') => {
    const WorkflowView = await getWorkflowViewModel();
    const view = await WorkflowView.findOne({ name, userId }).exec();
    return toSerializable(view);
};

const createView = async viewData => {
    const WorkflowView = await getWorkflowViewModel();
    const payload = buildViewPayload(viewData);

    const existing = await WorkflowView.findOne({ name: payload.name, userId: payload.userId }).exec();
    if (existing) {
        throw Object.assign(new Error(`View with name "${payload.name}" already exists`), { statusCode: 409 });
    }

    const created = await WorkflowView.create(payload);
    return toSerializable(created);
};

const updateView = async (viewId, updateData) => {
    const WorkflowView = await getWorkflowViewModel();
    const view = await WorkflowView.findById(viewId).exec();

    if (!view) {
        throw Object.assign(new Error('View not found'), { statusCode: 404 });
    }

    if (typeof updateData.name === 'string' && updateData.name.trim() !== view.name) {
        const duplicate = await WorkflowView.findOne({
            _id: { $ne: viewId },
            name: updateData.name.trim(),
            userId: view.userId
        }).exec();

        if (duplicate) {
            throw Object.assign(new Error(`View with name "${updateData.name.trim()}" already exists`), { statusCode: 409 });
        }

        view.name = updateData.name.trim();
    }

    if (Array.isArray(updateData.components)) {
        view.components = updateData.components;
        view.metadata.componentCount = updateData.components.length;
        view.metadata.componentTypes = [...new Set(updateData.components.map(component => component.type).filter(Boolean))];
    }

    if (updateData.selectedMeteorData !== undefined) {
        view.selectedMeteorData = updateData.selectedMeteorData;
    }

    if (updateData.description !== undefined) {
        view.metadata.description = updateData.description || '';
    }

    await view.save();
    return toSerializable(view);
};

const deleteView = async (name, userId = 'default') => {
    const WorkflowView = await getWorkflowViewModel();
    const deleted = await WorkflowView.findOneAndDelete({ name, userId }).exec();

    if (!deleted) {
        throw Object.assign(new Error('View not found'), { statusCode: 404 });
    }

    return { success: true, deletedName: name };
};

const importViews = async (viewsObject, userId = 'default') => {
    const imported = [];
    const errors = [];

    for (const [defaultName, viewData] of Object.entries(viewsObject)) {
        try {
            const created = await createView({
                name: viewData.name || defaultName,
                components: viewData.components || [],
                selectedMeteorData: viewData.selectedMeteorData || null,
                description: viewData.description || '',
                userId
            });
            imported.push(created);
        } catch (error) {
            errors.push(`Failed to import \"${defaultName}\": ${error.message}`);
        }
    }

    return {
        imported: imported.length,
        errors,
        views: imported
    };
};

const syncLocalStorageViews = async (localStorageViews, userId = 'default') => {
    if (!Array.isArray(localStorageViews) || localStorageViews.length === 0) {
        return { synced: 0, skipped: 0 };
    }

    const WorkflowView = await getWorkflowViewModel();
    let synced = 0;
    let skipped = 0;

    for (const view of localStorageViews) {
        const existing = await WorkflowView.findOne({ name: view.name, userId }).exec();
        if (existing) {
            skipped += 1;
            continue;
        }

        const payload = buildViewPayload({
            name: view.name,
            components: view.components || [],
            selectedMeteorData: view.selectedMeteorData || null,
            description: view.description || '',
            userId,
            syncedFromLocalStorage: true
        });

        if (view.createdAt) {
            payload.createdAt = new Date(view.createdAt);
        }
        if (view.updatedAt) {
            payload.updatedAt = new Date(view.updatedAt);
        }

        await WorkflowView.create(payload);
        synced += 1;
    }

    return { synced, skipped };
};

const getViewStats = async (userId = 'default') => {
    const WorkflowView = await getWorkflowViewModel();
    const [count, latestView] = await Promise.all([
        WorkflowView.countDocuments({ userId }).exec(),
        WorkflowView.findOne({ userId }).sort({ createdAt: -1 }).exec()
    ]);

    return {
        count,
        latestViewName: latestView?.name || null,
        latestViewDate: latestView?.createdAt || null
    };
};

module.exports = {
    getViews,
    getViewByName,
    createView,
    updateView,
    deleteView,
    importViews,
    syncLocalStorageViews,
    getViewStats
};
