import React from "react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Accept",
    cancelText = "Cancel",
    variant = "danger" // "danger", "warning", "info"
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="confirmation-modal-backdrop" onClick={handleBackdropClick}>
            <div className="confirmation-modal">
                <div className="confirmation-modal-header">
                    <h4 className="confirmation-modal-title">{title}</h4>
                </div>
                
                <div className="confirmation-modal-body">
                    <p className="confirmation-modal-message">{message}</p>
                </div>
                
                <div className="confirmation-modal-footer">
                    <button 
                        className="confirmation-modal-button cancel-button"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`confirmation-modal-button confirm-button ${variant}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
