import React, { useState, useEffect, useRef } from "react";
import TemplateService from "../services/TemplateService";

const DEFAULT_TEXT = "Haz clic aquí para escribir una descripción...";

const Description = ({ selectedMeteorData, value, onChange }) => {
    const [text, setText] = useState(value || DEFAULT_TEXT);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasUserEdited, setHasUserEdited] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const textRef = useRef(null);

    const templates = TemplateService.getTemplates();
    const meteorIdentifier = selectedMeteorData?.Identificador || selectedMeteorData?.identifier;

    const handleTemplateSelect = async (templateKey) => {
        if (!templateKey) {
            setText(DEFAULT_TEXT);
            setSelectedTemplate("");
            setHasUserEdited(false);
            return;
        }

        setIsLoading(true);
        setSelectedTemplate(templateKey);
        setHasUserEdited(false);

        try {
            let processedText;

            if (meteorIdentifier) {
                processedText = await TemplateService.processTemplateWithMeteorData(templateKey, meteorIdentifier);
            } else {
                processedText = "Selecciona primero un meteoro con el widget MeteorInput para poder usar plantillas automáticas.";
            }

            setText(processedText);
            setShowTemplates(false);
        } catch (error) {
            setText(`Error al cargar la plantilla: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = () => {
        setIsEditing(true);
    };

    const handleFocus = () => {
        if (text === DEFAULT_TEXT) {
            setText("");
        }
        setIsEditing(true);
    };

    const handleBlur = (e) => {
        const newText = e.target.innerHTML.trim();
        const normalizedText = newText === "" || newText === "<br>" ? DEFAULT_TEXT : newText;

        setText(normalizedText);
        setHasUserEdited(normalizedText !== DEFAULT_TEXT);
        setIsEditing(false);

        if (onChange) {
            onChange(normalizedText === DEFAULT_TEXT ? "" : normalizedText);
        }
    };

    const handleInsertLink = () => {
        setShowLinkDialog(true);
        setLinkUrl("");
        setLinkText("");
    };

    const handleConfirmLink = () => {
        if (!linkUrl || !linkText || !textRef.current) {
            return;
        }

        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            if (textRef.current.contains(range.commonAncestorContainer)) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = linkHtml;
                const linkElement = tempDiv.firstChild;
                range.insertNode(linkElement);
                range.setStartAfter(linkElement);
                range.setEndAfter(linkElement);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                textRef.current.innerHTML += linkHtml;
            }
        } else {
            textRef.current.innerHTML += linkHtml;
        }

        textRef.current.focus();
        setShowLinkDialog(false);
        setHasUserEdited(true);
    };

    const handleCancelLink = () => {
        setShowLinkDialog(false);
        setLinkUrl("");
        setLinkText("");
    };

    const handleLinkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const link = e.target;
        if (link.tagName === "A" && link.href) {
            window.open(link.href, "_blank", "noopener,noreferrer");
        }
    };

    useEffect(() => {
        if (meteorIdentifier && selectedTemplate && !isEditing && !hasUserEdited) {
            handleTemplateSelect(selectedTemplate);
        }
    }, [meteorIdentifier, selectedTemplate, isEditing, hasUserEdited]);

    useEffect(() => {
        if (typeof value === "string") {
            setText(value || DEFAULT_TEXT);
        }
    }, [value]);

    return (
        <div className="workflow-description-card">
            <div className="description-template-container no-print">
                <div className="workflow-inline-actions">
                    <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="widget-button"
                    >
                        <i className="fa fa-file-text-o"></i>
                        {selectedTemplate ? "Cambiar plantilla" : "Usar plantilla"}
                    </button>

                    {selectedTemplate && (
                        <button
                            type="button"
                            onClick={() => handleTemplateSelect("")}
                            className="widget-button-clear"
                        >
                            <i className="fa fa-times"></i>
                            Quitar plantilla
                        </button>
                    )}

                    {meteorIdentifier && (
                        <span className="workflow-meta-pill">
                            <i className="fa fa-check-circle"></i>
                            Meteoro activo: {meteorIdentifier}
                        </span>
                    )}
                </div>

                {showTemplates && (
                    <div className="description-template-dropdown">
                        {Object.entries(templates).map(([key, template]) => (
                            <div
                                key={key}
                                className="description-template-item"
                                onClick={() => handleTemplateSelect(key)}
                            >
                                <div className="description-template-name">{template.name}</div>
                                <div className="description-template-variables">
                                    Variables: {template.variables.map(variable => variable.name).join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="description-editor-shell">
                {(isEditing || showLinkDialog) && (
                    <div className="no-print workflow-inline-actions workflow-inline-actions-compact">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInsertLink();
                            }}
                            className="description-link-button"
                        >
                            <i className="fa fa-link"></i>
                            Insertar enlace
                        </button>
                    </div>
                )}

                <p
                    ref={textRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={`description-text-area exportable-content description-text ${isEditing ? "is-editing" : ""}`}
                    onInput={handleTextChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onClick={handleLinkClick}
                    dangerouslySetInnerHTML={{
                        __html: isLoading
                            ? '<span class="workflow-loading-inline"><i class="fa fa-spinner fa-spin"></i> Cargando plantilla...</span>'
                            : text
                    }}
                />
            </div>

            {selectedTemplate && (
                <div className="description-template-info no-print">
                    <i className="fa fa-info-circle"></i>
                    Usando plantilla: {templates[selectedTemplate].name}
                    {!meteorIdentifier && (
                        <span className="description-template-warning">
                            <i className="fa fa-exclamation-triangle"></i>
                            Sin meteoro seleccionado
                        </span>
                    )}
                </div>
            )}

            {showLinkDialog && (
                <>
                    <div className="workflow-dialog-backdrop" onClick={handleCancelLink}></div>
                    <div className="workflow-dialog" role="dialog" aria-modal="true">
                        <h3>Insertar enlace</h3>
                        <div className="workflow-dialog-field">
                            <label htmlFor="workflow-link-text">Texto visible</label>
                            <input
                                id="workflow-link-text"
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Texto del enlace"
                            />
                        </div>
                        <div className="workflow-dialog-field">
                            <label htmlFor="workflow-link-url">URL</label>
                            <input
                                id="workflow-link-url"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="workflow-dialog-actions">
                            <button type="button" className="widget-button-clear" onClick={handleCancelLink}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="widget-button"
                                onClick={handleConfirmLink}
                                disabled={!linkUrl || !linkText}
                            >
                                Insertar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Description;
