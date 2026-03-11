// Frontend Views Service - Simplified with clean fallback logic
import { API_ENDPOINTS, fetchApi } from '../config/api';

export class ViewsService {
    // localStorage management with size limit
    static getLocalStorageViews() {
        try {
            const saved = localStorage.getItem('savedViews_backup');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error reading localStorage backup:', error);
            return [];
        }
    }

    static saveToLocalStorage(views) {
        try {
            // Limit localStorage to prevent infinite growth
            const MAX_LOCAL_STORAGE_VIEWS = 10;
            const limitedViews = views
                .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
                .slice(0, MAX_LOCAL_STORAGE_VIEWS);
            
            localStorage.setItem('savedViews_backup', JSON.stringify(limitedViews));
        } catch (error) {
            console.error('Error saving to localStorage backup:', error);
        }
    }

    static addToLocalStorage(view) {
        try {
            const views = this.getLocalStorageViews();
            
            // Check if view name already exists in localStorage
            const existingViewIndex = views.findIndex(v => v.name === view.name);
            
            const newView = {
                ...view,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (existingViewIndex >= 0) {
                // Update existing view
                views[existingViewIndex] = newView;
            } else {
                // Add new view
                views.push(newView);
            }
            
            this.saveToLocalStorage(views);
            return newView;
        } catch (error) {
            console.error('Error adding to localStorage backup:', error);
            throw error;
        }
    }

    static removeFromLocalStorage(viewName) {
        try {
            const views = this.getLocalStorageViews();
            const filteredViews = views.filter(v => v.name !== viewName);
            this.saveToLocalStorage(filteredViews);
        } catch (error) {
            console.error('Error removing from localStorage backup:', error);
            throw error;
        }
    }

    // Helper method to create fetch requests with timeout
    static async fetchWithTimeout(url, options = {}, timeout = 2000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetchApi(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - MongoDB may be unavailable');
            }
            throw error;
        }
    }

    // Get all views - try MongoDB first, fallback to localStorage
    static async getAllViews(userId = 'default') {
        try {
            const response = await this.fetchWithTimeout(`${API_ENDPOINTS.views.getAll}?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`MongoDB unavailable: ${response.statusText}`);
            }

            const data = await response.json();
            let views = data.views || [];
            
            console.log('Initial MongoDB views:', views.length);
            
            // Get localStorage views before syncing
            const localStorageViews = this.getLocalStorageViews();
            console.log('localStorage views before sync:', localStorageViews.length);
            
            // Sync localStorage views to MongoDB first (before overwriting localStorage)
            const syncResult = await this.syncLocalStorageToMongoDB(userId);
            console.log('Sync result:', syncResult);
            
            // After sync, get the updated views from MongoDB (which now includes synced views)
            const updatedResponse = await this.fetchWithTimeout(`${API_ENDPOINTS.views.getAll}?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                views = updatedData.views || [];
                console.log('Updated MongoDB views after sync:', views.length);
            }
            
            // Now save the complete set of MongoDB views to localStorage backup
            this.saveToLocalStorage(views);
            
            return { views, isLocalStorageFallback: false };
        } catch (error) {
            console.warn('MongoDB unavailable, using localStorage backup');
            return { views: this.getLocalStorageViews(), isLocalStorageFallback: true };
        }
    }

    // Create a view - save to both MongoDB and localStorage
    static async createView(viewData, userId = 'default') {
        // Always save to localStorage first
        const localView = this.addToLocalStorage(viewData);
        
        try {
            // Try to save to MongoDB
            const response = await this.fetchWithTimeout(API_ENDPOINTS.views.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: viewData.name,
                    components: viewData.components,
                    selectedMeteorData: viewData.selectedMeteorData,
                    description: viewData.description,
                    userId: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    throw new Error(errorData.message || 'A view with this name already exists');
                }
                throw new Error(errorData.message || `Failed to create view: ${response.statusText}`);
            }

            const data = await response.json();
            return data.view;
        } catch (error) {
            console.warn('MongoDB unavailable, view saved to localStorage only');
            const fallbackError = new Error('MongoDB unavailable - view saved to localStorage backup');
            fallbackError.isLocalStorageFallback = true;
            fallbackError.view = localView;
            throw fallbackError;
        }
    }

    // Create or update a view - handles overwriting
    static async createOrUpdateView(viewData, userId = 'default', forceOverwrite = false) {
        if (forceOverwrite) {
            // For overwrite, first try to delete the existing view, then create new one
            try {
                await this.deleteView(viewData.name);
            } catch (error) {
                // Ignore delete errors - view might not exist
                console.log('No existing view to delete for overwrite');
            }
        }
        
        // Always save to localStorage first
        const localView = this.addToLocalStorage(viewData);
        
        try {
            // Try to save to MongoDB
            const response = await this.fetchWithTimeout(API_ENDPOINTS.views.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: viewData.name,
                    components: viewData.components,
                    selectedMeteorData: viewData.selectedMeteorData,
                    description: viewData.description,
                    userId: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    throw new Error(errorData.message || 'A view with this name already exists');
                }
                throw new Error(errorData.message || `Failed to create view: ${response.statusText}`);
            }

            const data = await response.json();
            return data.view;
        } catch (error) {
            console.warn('MongoDB unavailable, view saved to localStorage only');
            const fallbackError = new Error('MongoDB unavailable - view saved to localStorage backup');
            fallbackError.isLocalStorageFallback = true;
            fallbackError.view = localView;
            throw fallbackError;
        }
    }

    // Delete a view - delete from both MongoDB and localStorage
    static async deleteView(viewName) {
        // Always remove from localStorage
        this.removeFromLocalStorage(viewName);
        
        try {
            // Try to delete from MongoDB
            const response = await this.fetchWithTimeout(API_ENDPOINTS.views.delete(viewName), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    throw new Error('View not found');
                }
                throw new Error(errorData.message || `Failed to delete view: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('MongoDB unavailable, view deleted from localStorage only');
            const fallbackError = new Error('MongoDB unavailable - view deleted from localStorage backup');
            fallbackError.isLocalStorageFallback = true;
            throw fallbackError;
        }
    }

    // Sync localStorage views to MongoDB
    static async syncLocalStorageToMongoDB(userId = 'default') {
        try {
            const localStorageViews = this.getLocalStorageViews();
            console.log('Sync: localStorage views to sync:', localStorageViews.length);
            
            if (localStorageViews.length === 0) {
                console.log('Sync: No localStorage views to sync');
                return { synced: 0, skipped: 0 };
            }

            console.log('Sync: Sending to backend:', localStorageViews.map(v => v.name));
            
            const response = await this.fetchWithTimeout(API_ENDPOINTS.views.sync, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    localStorageViews: localStorageViews,
                    userId: userId
                }),
            }, 5000);

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Sync: Backend result - synced: ${data.synced}, skipped: ${data.skipped}`);
            
            return data;
        } catch (error) {
            console.warn('Sync: Failed to sync localStorage views to MongoDB:', error.message);
            return { synced: 0, skipped: 0 };
        }
    }

    // Get a specific view by ID
    static async getViewById(viewId) {
        try {
            const response = await fetchApi(API_ENDPOINTS.views.getById(viewId), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('View not found');
                }
                throw new Error(`Failed to fetch view: ${response.statusText}`);
            }

            const data = await response.json();
            return data.view;
        } catch (error) {
            console.error('Error fetching view:', error);
            throw error;
        }
    }

    // Update an existing view
    static async updateView(viewId, updateData) {
        try {
            const response = await fetchApi(API_ENDPOINTS.views.update(viewId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    throw new Error('View not found');
                }
                if (response.status === 409) {
                    throw new Error(errorData.message || 'A view with this name already exists');
                }
                throw new Error(errorData.message || `Failed to update view: ${response.statusText}`);
            }

            const data = await response.json();
            return data.view;
        } catch (error) {
            console.error('Error updating view:', error);
            throw error;
        }
    }

    // Import views from localStorage format
    static async importViews(localStorageViews, userId = 'default') {
        try {
            const response = await fetchApi(API_ENDPOINTS.views.import, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    views: localStorageViews,
                    userId: userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to import views: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error importing views:', error);
            throw error;
        }
    }

    // Get view statistics
    static async getViewStats(userId = 'default') {
        try {
            const response = await fetchApi(`${API_ENDPOINTS.views.stats}?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch view stats: ${response.statusText}`);
            }

            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error('Error fetching view stats:', error);
            throw error;
        }
    }

    // Cleanup localStorage to prevent infinite growth
    static cleanupLocalStorage() {
        try {
            const views = this.getLocalStorageViews();
            if (views.length > 10) {
                // Keep only the last 10 views (most recent)
                const limitedViews = views.slice(-10);
                this.saveToLocalStorage(limitedViews);
                console.log(`localStorage cleanup: kept ${limitedViews.length} most recent views`);
            }
        } catch (error) {
            console.error('Error cleaning up localStorage:', error);
        }
    }

    // Get localStorage statistics
    static getLocalStorageStats() {
        try {
            const views = this.getLocalStorageViews();
            return {
                viewCount: views.length,
                totalSize: JSON.stringify(views).length,
                views: views.map(v => ({ name: v.name, createdAt: v.createdAt }))
            };
        } catch (error) {
            console.error('Error getting localStorage stats:', error);
            return { viewCount: 0, totalSize: 0, views: [] };
        }
    }
}