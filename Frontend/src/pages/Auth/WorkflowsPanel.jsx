import React from 'react';
import BackToAdminPanel from '@/components/admin/BackToAdminPanel.jsx';
import WorkflowsStudio from '@/features/workflows/WorkflowsStudio.jsx';

const WorkflowsPanel = () => {
    return (
        <div className="workflows-shell">
            <BackToAdminPanel />
            <div className="workflows-page-container">
                <WorkflowsStudio />
            </div>
        </div>
    );
};

export default WorkflowsPanel;
