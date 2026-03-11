const mongoose = require('mongoose');

const workflowViewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100
        },
        components: {
            type: Array,
            default: []
        },
        selectedMeteorData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        userId: {
            type: String,
            required: true,
            default: 'default'
        },
        metadata: {
            componentCount: {
                type: Number,
                default: 0
            },
            componentTypes: {
                type: [String],
                default: []
            },
            description: {
                type: String,
                default: ''
            },
            syncedFromLocalStorage: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        collection: 'user_views',
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    }
);

workflowViewSchema.index({ name: 1, userId: 1 }, { unique: true });
workflowViewSchema.index({ createdAt: -1 });
workflowViewSchema.index({ userId: 1 });

let connectionPromise = null;

const buildMongoUri = () => {
    if (process.env.MONGO_URL) {
        return process.env.MONGO_URL;
    }

    if (!process.env.MONGO_HOST) {
        return null;
    }

    const host = process.env.MONGO_HOST || 'localhost';
    const port = process.env.MONGO_PORT || '27017';
    const database = process.env.MONGO_DB || 'sma_workflows';
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;

    if (username && password) {
        return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=admin`;
    }

    return `mongodb://${host}:${port}/${database}`;
};

const getWorkflowViewModel = async () => {
    const uri = buildMongoUri();

    if (!uri) {
        throw new Error('MongoDB workflows storage is not configured');
    }

    if (!connectionPromise) {
        const connection = mongoose.createConnection(uri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });

        connectionPromise = connection.asPromise().catch(error => {
            connectionPromise = null;
            throw error;
        });
    }

    const connection = await connectionPromise;
    return connection.models.WorkflowView || connection.model('WorkflowView', workflowViewSchema);
};

module.exports = {
    getWorkflowViewModel
};
