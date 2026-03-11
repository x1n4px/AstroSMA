// React and third-party imports
import React, { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Local imports
import { API_ENDPOINTS, fetchApi } from "./config/api";
import { ViewsService } from "./services/ViewsService";
import DataChart from "./components/DataChart";
import ShowMeteors from "./components/ShowMeteors";
import InteractiveMap from "./components/InteractiveMap";
import RunQuery from "./components/RunQuery";
import Title from "./components/Title";
import Description from "./components/Description";
import YouTubeVideo from "./components/YoutubeVideo";
import Video from "./components/Video";
import Photo from "./components/Photo";
import UploadVideoToYouTube from "./components/UploadVideoToYouTube";
import MeteorInput from "./components/MeteorInput";
import ConfirmationModal from "./components/ConfirmationModal";

// Styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import "./WorkflowsStudio.css";

const createComponentId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", border: "2px solid #ff0000", borderRadius: "5px", margin: "10px" }}>
                    <h3>Error de componente</h3>
                    <p>Este widget ha fallado y se ha aislado para no romper el resto del informe.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>Reintentar</button>
                    <details style={{ marginTop: "10px" }}>
                        <summary>Ver detalle</summary>
                        <pre>{this.state.error?.toString()}</pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

// Define components with their configurations
const COMPONENTS = {
    MeteorInput: {
        component: MeteorInput,
        description: "Busca meteoro por fecha, hora u observatorio y úsalo como contexto para el resto del informe"
    },
    Title: {
        component: Title,
        description: "Añade cabeceras editables para ordenar cada bloque del informe"
    },
    Description: {
        component: Description,
        description: "Inserta texto enriquecido, plantillas y enlaces dentro del flujo de trabajo"
    },
    DataChart: {
        component: DataChart,
        description: "Genera gráficos y análisis a partir de los datos del meteoro o de consultas generales"
    },
    InteractiveMap: {
        component: InteractiveMap,
        description: "Representa observatorios y trayectorias estimadas sobre un mapa interactivo",
        props: {
            markers: [
                { lat: "+39 +40 +00.00", lon: "+002 +48 +18.00", label: "Consell" },
                { lat: "+41 +30 +25.31", lon: "+001 +49 +35.51", label: "Masquefa" },
                { lat: "+39 +45 +32.40", lon: "-000 -23 -48.84", label: "Segorbe" }
            ],
            trajectory: {
                start: { lat: "40:30:27.8", lon: "1:14:38.1", alt: 85000 },
                end: { lat: "39:50:13.8", lon: "1:46:43.1", alt: 25000 }
            }
        }
    },
    YouTubeVideo: {
        component: YouTubeVideo,
        description: "Inserta vídeos de YouTube relacionados con observaciones o divulgación"
    },
    Video: {
        component: Video,
        description: "Sube y muestra vídeos locales asociados a una observación"
    },
    Photo: {
        component: Photo,
        description: "Añade imágenes de meteoros, instrumental o capturas de apoyo"
    },
    RunQuery: {
        component: RunQuery,
        description: "Ejecuta consultas SQL personalizadas y muestra los resultados en tablas"
    },
    ShowMeteors: {
        component: ShowMeteors,
        description: "Consulta listados de meteoros disponibles directamente desde la base de datos"
    },
    UploadVideoToYouTube: {
        component: UploadVideoToYouTube,
        description: "Prepara la subida directa de vídeos de observación a YouTube"
    }
};

// Define the order of components in the library
// To add new components or change order, simply modify this array
const COMPONENT_ORDER = [
    "MeteorInput",
    "Title",
    "Description",
    "DataChart",
    "InteractiveMap",
    "YouTubeVideo",
    "Video",
    "Photo",
    "RunQuery",
    "ShowMeteors",
    "UploadVideoToYouTube"
];

// No legacy mapping needed - all components use new names

const DraggableDroppedComponent = ({ id, index, type, instanceProps, moveComponent, handleRemove, selectedMeteorData, onMeteorSelect, onUpdateProps }) => {
    const ref = useRef(null);

    // All hooks must be called before any early returns
    const [{ handlerId }, drop] = useDrop({
        accept: "component",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId()
            };
        },
        hover(item) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            moveComponent(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag] = useDrag({
        type: "component",
        item: () => {
            return { id, index };
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    // Safety check: ensure the component type exists (after hooks)
    const componentConfig = COMPONENTS[type];
    if (!componentConfig) {
        console.error(`Component type "${type}" not found in COMPONENTS. Removing invalid component.`);
        // Remove the invalid component
        handleRemove(index);
        return null;
    }

    const { component: Component, props = {} } = componentConfig;

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    // Prepare props based on component type
    let componentProps = { ...props };
    // Merge per-instance props saved with the component
    if (instanceProps) {
        componentProps = { ...componentProps, ...instanceProps };
    }

    // Add meteor-specific props for components that can use meteor data
    if (type === "MeteorInput") {
        componentProps.onMeteorSelect = onMeteorSelect;
        componentProps.selectedMeteorData = selectedMeteorData;
    } else if (["PlotXYGraph", "InteractiveMap", "ShowMeteors", "DataChart", "Description"].includes(type)) {
        componentProps.selectedMeteorData = selectedMeteorData;
    }

    // Provide change handlers for editable widgets to persist their content
    if (type === "Title") {
        componentProps.onChange = (updatedValues) => {
            if (onUpdateProps) {
                onUpdateProps(index, updatedValues);
            }
        };
    }
    if (type === "Description") {
        componentProps.onChange = (newValue) => {
            if (onUpdateProps) {
                onUpdateProps(index, { value: newValue });
            }
        };
    }

    return (
        <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className="draggable-component">
            <div className="component-box">
                <button className="remove-button" onClick={() => handleRemove(index)}>
                    <i className="fa fa-times"></i>
                </button>
                <Component {...componentProps} />
            </div>
        </div>
    );
};

const DraggableItem = ({ type, description, onAddComponent }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "component",
        item: { type },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const handleAddClick = e => {
        e.stopPropagation(); // Prevent drag from triggering
        onAddComponent(type);
    };

    return (
        <div ref={drag} className={`draggable-item${isDragging ? " dragging" : ""}`}>
            <div className="draggable-item-content">
                <div className="component-info">
                    <span className="component-name">{type}</span>
                    <span className="component-description">{description}</span>
                </div>
                <button className="add-component-button" onClick={handleAddClick} title={`Añadir widget ${type}`}>
                    <i className="fa fa-plus"></i>
                </button>
            </div>
        </div>
    );
};

const DropArea = ({ onDropComponent, children }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const [, drop] = useDrop(() => ({
        accept: "component",
        drop: (item, monitor) => {
            try {
                setIsDragOver(false);
                if (!monitor.didDrop() && item?.type) {
                    onDropComponent(item.type);
                }
            } catch (error) {
                console.error("Drop error:", error);
                setIsDragOver(false);
            }
        },
        collect: (monitor) => {
            const isOver = monitor.isOver({ shallow: true });
            const canDrop = monitor.canDrop();
            const isDragging = monitor.getItem() !== null;
            
            // Update drag over state based on current monitor state
            if (isDragging && isOver && canDrop) {
                setIsDragOver(true);
            } else {
                setIsDragOver(false);
            }
            
            return {
                isOver,
                canDrop,
                isDragging
            };
        }
    }));

    return (
        <div ref={drop} className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}>
            {children}
            {!children || children.length === 0 ? (
                <div className="drop-zone-empty">
                    <div className="drop-zone-message">
                        <h3>Lienzo de trabajo</h3>
                        <p>{isDragOver ? <><i className='fa fa-bullseye'></i> Suelta aquí para añadir el widget</> : 'Arrastra widgets desde la biblioteca para construir informes y análisis dentro de AstroSMA'}</p>
                        <div className="drop-zone-instructions">
                            <div><i className="fa fa-bullseye"></i> Arrastra y suelta widgets</div>
                            <div><i className="fa fa-refresh"></i> Reordena moviendo bloques</div>
                            <div><i className="fa fa-times"></i> Elimina con el botón de cierre</div>
                            <div><i className="fa fa-print"></i> Exporta cuando el informe esté listo</div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const App = () => {
    // Load components from localStorage on startup
    const [droppedComponents, setDroppedComponents] = useState(() => {
        try {
            const saved = localStorage.getItem('droppedComponents');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved components:', error);
            return [];
        }
    });
    const [selectedMeteorData, setSelectedMeteorData] = useState(null);
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showSaveBeforeLoadModal, setShowSaveBeforeLoadModal] = useState(false);
    const [pendingSaveName, setPendingSaveName] = useState('');
    const [pendingDeleteName, setPendingDeleteName] = useState('');
    const [pendingLoadName, setPendingLoadName] = useState('');
    const [toastNotifications, setToastNotifications] = useState([]);
    const [savedViews, setSavedViews] = useState([]);
    const [isLoadingViews, setIsLoadingViews] = useState(false);
    const [isSavingView, setIsSavingView] = useState(false);
    const [isDeletingView, setIsDeletingView] = useState(false);
    const [showWordPressPreview, setShowWordPressPreview] = useState(false);
    const [wordPressContent, setWordPressContent] = useState('');
    const [wordPressTitle, setWordPressTitle] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Save components to localStorage whenever they change
    React.useEffect(() => {
        try {
            localStorage.setItem('droppedComponents', JSON.stringify(droppedComponents));
        } catch (error) {
            console.error('Error saving components:', error);
        }
    }, [droppedComponents]);


    // Clean up any invalid components on load
    React.useEffect(() => {
        setDroppedComponents(prev => {
            const validComponents = prev.filter(comp => {
                if (!comp.type || !COMPONENTS[comp.type]) {
                    console.warn(`Removing invalid component type: ${comp.type}`);
                    return false;
                }
                return true;
            });
            return validComponents.length !== prev.length ? validComponents : prev;
        });
    }, []);

    const handleDropComponent = type => {
        // Validate component type before adding
        if (!type || !COMPONENTS[type]) {
            console.error(`Cannot add component: type "${type}" not found in COMPONENTS`);
            return;
        }
        setDroppedComponents(prev => [...prev, { id: createComponentId(), type }]);
    };

    const handleRemoveComponent = indexToRemove => {
        setDroppedComponents(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const updateComponentProps = (targetIndex, newProps) => {
        setDroppedComponents(prev => {
            const updated = [...prev];
            const existing = updated[targetIndex] || {};
            updated[targetIndex] = {
                ...existing,
                props: {
                    ...(existing.props || {}),
                    ...newProps
                }
            };
            return updated;
        });
    };

    const handleMeteorSelect = meteorData => {
        console.log("Meteor selected in App:", meteorData);
        setSelectedMeteorData(meteorData);
    };

    const moveComponent = (fromIndex, toIndex) => {
        setDroppedComponents(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });
    };

    const handleClearAll = () => {
        setShowClearConfirmation(true);
    };

    const confirmClearAll = () => {
        setDroppedComponents([]);
        setShowClearConfirmation(false);
    };

    const cancelClearAll = () => {
        setShowClearConfirmation(false);
    };

    const publishToWordPress = async () => {
        try {
            // Get all widget elements from the DOM
            const widgetElements = document.querySelectorAll('.draggable-component .component-box');
            const widgets = Array.from(widgetElements).map((element, index) => {
                const componentElement = element.querySelector('[class*="component"]:not(.component-box)');
                const widgetType = droppedComponents[index]?.type;
                return {
                    type: widgetType,
                    element: componentElement || element
                };
            }).filter(widget => widget.type);

            // Import visual exporter dynamically to avoid issues
            const { visualExporter } = await import('./utils/visualExport');
            
            // Generate visual export content
            const exportContent = await visualExporter.generateVisualExport(widgets, 'wordpress');
            
            if (exportContent.length === 0) {
                showNotification('No content to export. Add some widgets to your report first.', 'warning');
                return;
            }

            // Generate HTML content
            const htmlContent = visualExporter.generateWordPressHTML(exportContent);
            
            // Show the HTML content in a modal
            showWordPressPreviewModal(htmlContent);
            
        } catch (error) {
            console.error('Error generating WordPress content:', error);
            showNotification('Error generating WordPress content. Please try again.', 'error');
        }
    };

    const handlePrintToPDF = () => {
        try {
            // Filter out excluded widgets for PDF export
            const excludedWidgets = ['UploadVideoToYouTube', 'MeteorInput'];
            const exportableComponents = droppedComponents.filter(comp => !excludedWidgets.includes(comp.type));
            
            // Check if there are any widgets to export
            if (exportableComponents.length === 0) {
                showNotification('No content to export. Add some widgets to your report first.', 'warning');
                return;
            }

            // Use browser's print functionality
            // The CSS print styles will hide the UI elements and show only the content
            window.print();
            
        } catch (error) {
            console.error('Error printing to PDF:', error);
            showNotification('Error printing to PDF. Please try again.', 'error');
        }
    };

    const showNotification = useCallback((message, type = 'success') => {
        // Use toast for all notification types (success, error, warning)
        const id = Date.now();
        const newToast = {
            id,
            message,
            type
        };
        
        setToastNotifications(prev => [...prev, newToast]);
        
        // Auto-dismiss after different durations based on type
        const duration = type === 'error' ? 5000 : type === 'warning' ? 4000 : 3000;
        setTimeout(() => {
            setToastNotifications(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToastNotifications(prev => prev.filter(toast => toast.id !== id));
    };

    // Load views from MongoDB
    const loadViewsFromDatabase = useCallback(async () => {
        try {
            setIsLoadingViews(true);
            const result = await ViewsService.getAllViews();
            const views = result.views;
            const isLocalStorageFallback = result.isLocalStorageFallback;
            
            console.log('Loaded views:', views.length, views);
            setSavedViews(views);
            
            // Show notification only if we're actually using localStorage fallback
            if (isLocalStorageFallback && views.length > 0) {
                // Only show notification if we haven't shown it recently
                const lastNotification = localStorage.getItem('lastLocalStorageNotification');
                const now = Date.now();
                if (!lastNotification || (now - parseInt(lastNotification)) > 300000) { // 5 minutes
                    showNotification(`Operating in localStorage backup mode - ${views.length} views loaded`, 'warning');
                    localStorage.setItem('lastLocalStorageNotification', now.toString());
                }
            }
        } catch (error) {
            console.error('Error loading views from database:', error);
            
            const errorMessage = error.message.includes('timeout') 
                ? 'MongoDB connection timeout - database may be unavailable'
                : `Failed to load saved views: ${error.message}`;
            showNotification(errorMessage, 'error');
            setSavedViews([]);
        } finally {
            setIsLoadingViews(false);
        }
    }, [showNotification]);

    // Load views from database on startup
    React.useEffect(() => {
        loadViewsFromDatabase();
        
        // Cleanup localStorage periodically to prevent infinite growth
        const cleanupInterval = setInterval(() => {
            ViewsService.cleanupLocalStorage();
        }, 5 * 60 * 1000); // Every 5 minutes
        
        return () => clearInterval(cleanupInterval);
    }, [loadViewsFromDatabase]);

    const saveWorkspace = async (name, forceOverwrite = false) => {
        if (!name || name.trim() === '') {
            showNotification('Please provide a valid name for the view.', 'error');
            return;
        }

        // Prevent multiple saves
        if (isSavingView) {
            return;
        }

        const trimmedName = name.trim();

        // Check if view name already exists and we're not forcing overwrite
        if (!forceOverwrite && savedViews.some(view => view.name === trimmedName)) {
            setPendingSaveName(trimmedName);
            setShowOverwriteModal(true);
            return;
        }

        const viewData = {
            name: trimmedName,
            components: droppedComponents,
            selectedMeteorData: selectedMeteorData
        };

        try {
            setIsSavingView(true);
            
            // Save to MongoDB (use createOrUpdateView for overwrites)
            if (forceOverwrite) {
                await ViewsService.createOrUpdateView(viewData, 'default', true);
            } else {
                await ViewsService.createView(viewData);
            }
            
            // Refresh the views from database
            await loadViewsFromDatabase();
            
            setShowSaveModal(false);
            setShowOverwriteModal(false);
            setPendingSaveName('');
            showNotification(`View "${trimmedName}" ${forceOverwrite ? 'overwritten' : 'saved'} successfully!`);
        } catch (error) {
            console.error('Error saving workspace:', error);
            
            // Handle localStorage fallback
            if (error.isLocalStorageFallback && error.view) {
                // Refresh the views from localStorage
                await loadViewsFromDatabase();
                
                setShowSaveModal(false);
                setShowOverwriteModal(false);
                setPendingSaveName('');
                showNotification(`View "${trimmedName}" ${forceOverwrite ? 'overwritten in' : 'saved to'} localStorage backup`, 'warning');
                return;
            }
            
            if (error.message.includes('already exists')) {
                showNotification(`A view named "${trimmedName}" already exists. Please choose a different name.`, 'error');
            } else {
                showNotification('Error saving view. Please try again.', 'error');
            }
        } finally {
            setIsSavingView(false);
        }
    };

    const confirmOverwrite = () => {
        const isFromSaveBeforeLoad = pendingLoadName !== ''; // Check if we're in save-before-load flow
        saveWorkspace(pendingSaveName, true);
        
        if (isFromSaveBeforeLoad) {
            // After saving, load the requested view
            setTimeout(() => {
                performLoad(pendingLoadName);
                setPendingLoadName('');
            }, 100);
        }
    };

    const cancelOverwrite = () => {
        setShowOverwriteModal(false);
        setPendingSaveName('');
    };

    const loadWorkspace = (viewName) => {
        const view = savedViews.find(v => v.name === viewName);
        if (!view) {
            showNotification('View not found.', 'error');
            return;
        }

        // Check if there are components in the current workspace
        if (droppedComponents.length > 0) {
            setPendingLoadName(viewName);
            setShowSaveBeforeLoadModal(true);
            return;
        }

        // No components, load directly
        performLoad(viewName);
    };

    const performLoad = (viewName) => {
        const view = savedViews.find(v => v.name === viewName);
        if (!view) {
            showNotification('View not found.', 'error');
            return;
        }

        try {
            setDroppedComponents(view.components || []);
            setSelectedMeteorData(view.selectedMeteorData || null);
            setShowLoadModal(false);
            showNotification(`View "${view.name}" loaded successfully!`);
        } catch (error) {
            console.error('Error loading workspace:', error);
            showNotification('Error loading view. Please try again.', 'error');
        }
    };

    const requestDeleteWorkspace = (viewName) => {
        setPendingDeleteName(viewName);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteWorkspace = async () => {
        // Prevent multiple deletes
        if (isDeletingView) {
            return;
        }

        try {
            const view = savedViews.find(v => v.name === pendingDeleteName);
            if (!view) {
                showNotification('View not found.', 'error');
                return;
            }

            setIsDeletingView(true);
            
            // Delete by name - works for both MongoDB and localStorage
            await ViewsService.deleteView(pendingDeleteName);
            
            // Refresh the views from database
            await loadViewsFromDatabase();
            
            setShowDeleteConfirmModal(false);
            setPendingDeleteName('');
            showNotification(`View "${pendingDeleteName}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting workspace:', error);
            
            // Handle localStorage fallback
            if (error.isLocalStorageFallback) {
                // Refresh the views from localStorage
                await loadViewsFromDatabase();
                
                setShowDeleteConfirmModal(false);
                setPendingDeleteName('');
                showNotification(error.message, 'warning');
                return;
            }
            
            showNotification('Error deleting view. Please try again.', 'error');
        } finally {
            setIsDeletingView(false);
        }
    };

    const cancelDeleteWorkspace = () => {
        setShowDeleteConfirmModal(false);
        setPendingDeleteName('');
    };

    const proceedToLoadWithoutSaving = () => {
        setShowSaveBeforeLoadModal(false);
        performLoad(pendingLoadName);
        setPendingLoadName('');
    };

    const saveCurrentAndProceedToLoad = async (name) => {
        if (!name || name.trim() === '') {
            showNotification('Please provide a valid name for the current view.', 'error');
            return;
        }

        const trimmedName = name.trim();

        // Check if view name already exists
        if (savedViews.some(view => view.name === trimmedName)) {
            setPendingSaveName(trimmedName);
            setShowSaveBeforeLoadModal(false);
            setShowOverwriteModal(true);
            return;
        }

        // Save current workspace to MongoDB
        const viewData = {
            name: trimmedName,
            components: droppedComponents,
            selectedMeteorData: selectedMeteorData
        };

        try {
            await ViewsService.createView(viewData);
            await loadViewsFromDatabase();
            setShowSaveBeforeLoadModal(false);
            showNotification(`View "${trimmedName}" saved successfully!`);
            
            // Now load the requested view
            performLoad(pendingLoadName);
            setPendingLoadName('');
        } catch (error) {
            console.error('Error saving workspace:', error);
            
            // Handle localStorage fallback
            if (error.isLocalStorageFallback && error.view) {
                await loadViewsFromDatabase();
                setShowSaveBeforeLoadModal(false);
                showNotification(error.message, 'warning');
                
                // Now load the requested view
                performLoad(pendingLoadName);
                setPendingLoadName('');
                return;
            }
            
            showNotification('Error saving view. Please try again.', 'error');
        }
    };

    const cancelSaveBeforeLoad = () => {
        setShowSaveBeforeLoadModal(false);
        setPendingLoadName('');
    };

    const showWordPressPreviewModal = (content) => {
        setWordPressContent(content);
        setShowWordPressPreview(true);
    };

    const closeWordPressPreview = () => {
        setShowWordPressPreview(false);
        setWordPressContent('');
        setWordPressTitle('');
        setIsPublishing(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Content copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy to clipboard', 'error');
        });
    };

    const handlePublishToWordPress = async () => {
        if (!wordPressTitle.trim()) {
            showNotification('Introduce un título para la publicación', 'warning');
            return;
        }

        setIsPublishing(true);
        
        try {
            const response = await fetchApi(API_ENDPOINTS.workflows.publishToWordPress, {
                method: 'POST',
                body: JSON.stringify({
                    title: wordPressTitle.trim(),
                    content: wordPressContent,
                    status: 'draft' // Publish as draft for review
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showNotification(
                    `Post published successfully! Post ID: ${result.postId}`, 
                    'success'
                );
                
                // Show additional info about the post
                setTimeout(() => {
                    showNotification(
                        `View post: ${result.postUrl}`, 
                        'success'
                    );
                }, 2000);
                
                // Close the modal after successful publication
                setTimeout(() => {
                    closeWordPressPreview();
                }, 3000);
            } else {
                throw new Error(result.message || 'Failed to publish to WordPress');
            }
        } catch (error) {
            console.error('WordPress publishing error:', error);
            showNotification(
                `Failed to publish to WordPress: ${error.message}`, 
                'error'
            );
        } finally {
            setIsPublishing(false);
        }
    };

    const componentTypesInUse = [...new Set(droppedComponents.map(component => component.type))];
    const latestSavedView =
        savedViews.length > 0
            ? [...savedViews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;
    const selectedMeteorIdentifier =
        selectedMeteorData?.identifier || selectedMeteorData?.Identificador || null;
    const selectedMeteorSummary = selectedMeteorIdentifier
        ? `MET-${selectedMeteorIdentifier}`
        : "Sin meteoro seleccionado";
    const workspaceStatus = droppedComponents.length > 0 ? "En edición" : "Vacío";

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="workflows-page">
                <section className="workflows-toolbar-card no-print">
                    <div className="workflows-toolbar-main">
                        <div className="workflows-toolbar-copy">
                            <span className="workflows-section-kicker">Editor visual</span>
                            <h2>Espacio de trabajo de Workflows</h2>
                            <p>
                                Diseña vistas reutilizables, combina datos de meteoros y exporta contenido con la misma lógica
                                de la aplicación anterior, pero dentro de AstroSMA.
                            </p>
                        </div>
                        <div className="workflow-context-pills">
                            <span className="workflow-context-pill">
                                <i className="fa fa-meteor"></i>
                                {selectedMeteorSummary}
                            </span>
                            <span className="workflow-context-pill">
                                <i className="fa fa-folder-open"></i>
                                {savedViews.length} vistas disponibles
                            </span>
                            <span className="workflow-context-pill">
                                <i className="fa fa-puzzle-piece"></i>
                                {componentTypesInUse.length} tipos activos
                            </span>
                        </div>
                    </div>
                    <div className="workflow-stats-grid">
                        <div className="workflow-stat-card">
                            <span className="workflow-stat-value">{droppedComponents.length}</span>
                            <span className="workflow-stat-label">widgets en el lienzo</span>
                        </div>
                        <div className="workflow-stat-card">
                            <span className="workflow-stat-value">{componentTypesInUse.length}</span>
                            <span className="workflow-stat-label">tipos combinados</span>
                        </div>
                        <div className="workflow-stat-card">
                            <span className="workflow-stat-value">{savedViews.length}</span>
                            <span className="workflow-stat-label">vistas persistidas</span>
                        </div>
                        <div className="workflow-stat-card">
                            <span className="workflow-stat-value">{workspaceStatus}</span>
                            <span className="workflow-stat-label">estado del informe</span>
                        </div>
                    </div>
                    <div className="wf-button-group">
                        <button 
                            className="app-button save-button" 
                            onClick={() => setShowSaveModal(true)}
                            disabled={droppedComponents.length === 0 || isSavingView}
                            title="Guardar la vista actual"
                        >
                            {isSavingView ? <><i className='fa fa-spinner fa-spin'></i> Guardando...</> : <><i className='fa fa-save'></i> Guardar vista</>}
                        </button>
                        <button 
                            className="app-button wf-load-button" 
                            onClick={async () => {
                                setShowLoadModal(true);
                                // Always try to load views from database (this will sync localStorage if MongoDB is available)
                                await loadViewsFromDatabase();
                            }}
                            disabled={isLoadingViews}
                            title="Abrir vistas guardadas"
                        >
                            {isLoadingViews ? <><i className='fa fa-spinner fa-spin'></i> Cargando...</> : <><i className='fa fa-folder-open'></i> Vistas guardadas</>}
                        </button>
                        <button className="app-button" onClick={handlePrintToPDF}>
                            <i className="fa fa-print"></i> Exportar PDF
                        </button>
                        <button className="app-button" onClick={publishToWordPress}>
                            <i className="fa fa-globe"></i> Publicar en MeteoroSMA
                        </button>
                        <button 
                            className="app-button wf-clear-button" 
                            onClick={handleClearAll}
                            disabled={droppedComponents.length === 0}
                        >
                            <i className="fa fa-trash"></i> Limpiar lienzo
                        </button>
                    </div>
                </section>

                <div className="app-container">
                    <div className="drop-zone-wrapper print-content" id="print-area">
                        <div className="workspace-header no-print">
                            <div>
                                <span className="workflows-section-kicker">Lienzo</span>
                                <h3>Informe en construcción</h3>
                                <p>
                                    Organiza los bloques que quieras exportar. El contenido del lienzo es lo que compone la vista final.
                                </p>
                            </div>
                            <div className="workspace-mini-meta">
                                <div>
                                    <span className="workspace-mini-label">Estado</span>
                                    <strong>{workspaceStatus}</strong>
                                </div>
                                <div>
                                    <span className="workspace-mini-label">Última vista</span>
                                    <strong>{latestSavedView?.name || "Sin historial"}</strong>
                                </div>
                            </div>
                        </div>

                        {selectedMeteorIdentifier && (
                            <div className="workspace-selected-meteor no-print">
                                <i className="fa fa-crosshairs"></i>
                                <span>
                                    Contexto activo: <strong>{selectedMeteorSummary}</strong>
                                    {selectedMeteorData?.date || selectedMeteorData?.Fecha ? ` · ${selectedMeteorData?.date || selectedMeteorData?.Fecha}` : ""}
                                    {selectedMeteorData?.time || selectedMeteorData?.Hora ? ` · ${selectedMeteorData?.time || selectedMeteorData?.Hora}` : ""}
                                </span>
                            </div>
                        )}

                        <div className="export-content">
                            <DropArea onDropComponent={handleDropComponent}>
                                {droppedComponents.map(({ id, type, props: instanceProps }, index) => (
                                    <ErrorBoundary key={id}>
                                        <DraggableDroppedComponent
                                            id={id}
                                            index={index}
                                            type={type}
                                            instanceProps={instanceProps}
                                            moveComponent={moveComponent}
                                            handleRemove={handleRemoveComponent}
                                            selectedMeteorData={selectedMeteorData}
                                            onMeteorSelect={handleMeteorSelect}
                                            onUpdateProps={updateComponentProps}
                                        />
                                    </ErrorBoundary>
                                ))}
                            </DropArea>
                        </div>
                    </div>

                    <aside className="component-library no-print">
                        <div className="library-header">
                            <span className="workflows-section-kicker">Biblioteca</span>
                            <h3>Widgets disponibles</h3>
                            <p className="library-instructions">
                                Añade bloques desde aquí y combínalos en el lienzo para construir una vista guardable y exportable.
                            </p>
                            <div className="library-summary-chip">
                                <i className="fa fa-cubes"></i>
                                {COMPONENT_ORDER.length} widgets preparados
                            </div>
                        </div>
                        <div className="library-list">
                            {COMPONENT_ORDER.map(type => (
                                <DraggableItem
                                    key={type}
                                    type={type}
                                    description={COMPONENTS[type].description}
                                    onAddComponent={handleDropComponent}
                                />
                            ))}
                        </div>
                    </aside>
                </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showClearConfirmation}
                onConfirm={confirmClearAll}
                onCancel={cancelClearAll}
                title="Vaciar lienzo"
                message="¿Seguro que quieres eliminar todos los widgets del lienzo? Esta acción no se puede deshacer."
                confirmText="Vaciar"
                cancelText="Cancelar"
                variant="danger"
            />

            {/* Save View Modal */}
            {showSaveModal && (
                <div className="wf-modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-save"></i> Guardar vista</h3>
                            <button className="wf-modal-close" onClick={() => setShowSaveModal(false)}><i className="fa fa-times"></i></button>
                        </div>
                        <div className="wf-modal-body">
                            <p>Guarda la configuración actual con un nombre reconocible para reutilizarla más tarde.</p>
                            <input
                                type="text"
                                placeholder="Nombre de la vista..."
                                className="workspace-name-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        saveWorkspace(e.target.value);
                                    }
                                }}
                                autoFocus
                                id="save-workspace-input"
                            />
                            <div className="workspace-info">
                                <p><strong>Widgets:</strong> {droppedComponents.length}</p>
                                <p><strong>Tipos:</strong> {[...new Set(droppedComponents.map(c => c.type))].join(', ')}</p>
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-primary"
                                onClick={() => {
                                    const input = document.getElementById('save-workspace-input');
                                    saveWorkspace(input.value);
                                }}
                                disabled={isSavingView}
                            >
                                {isSavingView ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={() => setShowSaveModal(false)}
                                disabled={isSavingView}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load View Modal */}
            {showLoadModal && (
                <div className="wf-modal-overlay" onClick={() => setShowLoadModal(false)}>
                    <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-folder-open"></i> Vistas guardadas</h3>
                            <div className="wf-modal-header-actions">
                                <button className="wf-modal-close" onClick={() => setShowLoadModal(false)}><i className="fa fa-times"></i></button>
                            </div>
                        </div>
                        <div className="wf-modal-body">
                            <p>Selecciona una vista para cargarla en el lienzo actual.</p>
                            <div className="workspace-list">
                                {savedViews.length === 0 ? (
                                    <div className="no-workspaces">
                                        <p>No hay vistas guardadas.</p>
                                        <p>Crea algunos widgets y guarda tu primera composición.</p>
                                        <p><small><i className="fa fa-lightbulb-o"></i> Si MongoDB no está disponible, se usa respaldo en localStorage</small></p>
                                    </div>
                                ) : (
                                    savedViews
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .map((view) => (
                                            <div key={view._id} className="workspace-item">
                                                <div className="workspace-item-info">
                                                    <h4>{view.name}</h4>
                                                    <p>
                                                        <strong>Widgets:</strong> {view.components.length} | 
                                                        <strong> Guardada:</strong> {new Date(view.createdAt).toLocaleString()}
                                                    </p>
                                                    <p className="workspace-components">
                                                        {[...new Set(view.components.map(c => c.type))].join(', ')}
                                                    </p>
                                                </div>
                                                <div className="workspace-item-actions">
                                                    <button 
                                                        className="workspace-action-button wf-load-button"
                                                        onClick={() => loadWorkspace(view.name)}
                                                    >
                                                        Cargar
                                                    </button>
                                                    <button 
                                                        className="workspace-action-button wf-delete-button"
                                                        onClick={() => requestDeleteWorkspace(view.name)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={() => setShowLoadModal(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overwrite Confirmation Modal */}
            {showOverwriteModal && (
                <div className="wf-modal-overlay" onClick={cancelOverwrite}>
                    <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-exclamation-triangle"></i> Sobrescribir vista</h3>
                            <button className="wf-modal-close" onClick={cancelOverwrite}><i className="fa fa-times"></i></button>
                        </div>
                        <div className="wf-modal-body">
                            <p>Ya existe una vista con el nombre <strong>"{pendingSaveName}"</strong>.</p>
                            <p>¿Quieres reemplazarla con la configuración actual?</p>
                            <div className="warning-info">
                                <p><strong><i className="fa fa-exclamation-triangle"></i> Aviso:</strong> la vista existente se sustituirá de forma permanente.</p>
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-danger"
                                onClick={confirmOverwrite}
                                disabled={isSavingView}
                            >
                                {isSavingView ? 'Sobrescribiendo...' : 'Sobrescribir'}
                            </button>
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={cancelOverwrite}
                                disabled={isSavingView}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="wf-modal-overlay" onClick={cancelDeleteWorkspace}>
                    <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-trash"></i> Eliminar vista</h3>
                            <button className="wf-modal-close" onClick={cancelDeleteWorkspace}><i className="fa fa-times"></i></button>
                        </div>
                        <div className="wf-modal-body">
                            <p>¿Seguro que quieres eliminar la vista <strong>"{savedViews.find(v => v.name === pendingDeleteName)?.name || pendingDeleteName || 'vista seleccionada'}"</strong>?</p>
                            <div className="warning-info">
                                <p><strong><i className="fa fa-exclamation-triangle"></i> Aviso:</strong> esta acción no se puede deshacer.</p>
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-danger"
                                onClick={confirmDeleteWorkspace}
                                disabled={isDeletingView}
                            >
                                {isDeletingView ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={cancelDeleteWorkspace}
                                disabled={isDeletingView}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Before Load Modal */}
            {showSaveBeforeLoadModal && (
                <div className="wf-modal-overlay" onClick={cancelSaveBeforeLoad}>
                    <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-save"></i> Guardar antes de cargar</h3>
                            <button className="wf-modal-close" onClick={cancelSaveBeforeLoad}><i className="fa fa-times"></i></button>
                        </div>
                        <div className="wf-modal-body">
                            <p>Tienes <strong>{droppedComponents.length} widget{droppedComponents.length !== 1 ? 's' : ''}</strong> en la vista actual.</p>
                            <p>¿Quieres guardarlos antes de cargar <strong>"{savedViews.find(v => v.name === pendingLoadName)?.name || pendingLoadName || 'la vista seleccionada'}"</strong>?</p>
                            
                            <div className="save-options">
                                <div className="save-option-section">
                                    <h4>Guardar vista actual</h4>
                                    <input
                                        type="text"
                                        placeholder="Nombre para la vista actual..."
                                        className="workspace-name-input"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                saveCurrentAndProceedToLoad(e.target.value);
                                            }
                                        }}
                                        autoFocus
                                        id="save-before-load-input"
                                    />
                                    <div className="workspace-info">
                                        <p><strong>Widgets:</strong> {droppedComponents.length}</p>
                                        <p><strong>Tipos:</strong> {[...new Set(droppedComponents.map(c => c.type))].join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-primary"
                                onClick={() => {
                                    const input = document.getElementById('save-before-load-input');
                                    saveCurrentAndProceedToLoad(input.value);
                                }}
                            >
                                Guardar y cargar
                            </button>
                            <button 
                                className="wf-modal-button wf-modal-button-warning"
                                onClick={proceedToLoadWithoutSaving}
                            >
                                Cargar sin guardar
                            </button>
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={cancelSaveBeforeLoad}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div className="wf-toast-container">
                {toastNotifications.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`wf-toast wf-toast-${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className="wf-toast-content">
                            <span className="wf-toast-icon">
                                {toast.type === 'success' && <i className="fa fa-check-circle"></i>}
                                {toast.type === 'error' && <i className="fa fa-times-circle"></i>}
                                {toast.type === 'warning' && <i className="fa fa-exclamation-triangle"></i>}
                            </span>
                            <span className="wf-toast-message">{toast.message}</span>
                            <button 
                                className="wf-toast-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeToast(toast.id);
                                }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* WordPress Preview Modal */}
            {showWordPressPreview && (
                <div className="wf-modal-overlay" onClick={closeWordPressPreview}>
                    <div className="wf-modal-content export-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wf-modal-header">
                            <h3><i className="fa fa-globe"></i> Previsualización para WordPress</h3>
                            <button className="wf-modal-close" onClick={closeWordPressPreview}><i className="fa fa-times"></i></button>
                        </div>
                        <div className="wf-modal-body">
                            <div className="wordpress-publish-form">
                                <div className="wf-form-group">
                                    <label htmlFor="wordpress-title">Título de la entrada:</label>
                                    <input
                                        id="wordpress-title"
                                        type="text"
                                        value={wordPressTitle}
                                        onChange={(e) => setWordPressTitle(e.target.value)}
                                        placeholder="Introduce un título para la entrada"
                                        className="wf-form-input"
                                        disabled={isPublishing}
                                    />
                                </div>
                                <p>Este es el HTML que se enviaría a WordPress:</p>
                                <div className="export-preview-actions">
                                    <button 
                                        className="wf-modal-button wf-modal-button-primary"
                                        onClick={() => copyToClipboard(wordPressContent)}
                                        disabled={isPublishing}
                                    >
                                        <i className="fa fa-copy"></i> Copiar HTML
                                    </button>
                                    <button 
                                        className="wf-modal-button wf-modal-button-success"
                                        onClick={handlePublishToWordPress}
                                        disabled={!wordPressTitle.trim() || isPublishing}
                                    >
                                        {isPublishing ? (
                                            <>
                                                <i className="fa fa-spinner fa-spin"></i> Publicando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-globe"></i> Publicar en WordPress
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="export-preview-content">
                                <pre>{wordPressContent}</pre>
                            </div>
                        </div>
                        <div className="wf-modal-footer">
                            <button 
                                className="wf-modal-button wf-modal-button-secondary"
                                onClick={closeWordPressPreview}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DndProvider>
    );
};

export default App;
