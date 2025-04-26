import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminPanel = () => {
      const { t, i18n } = useTranslation(['text']);
    
    return (
        <div className="container mt-5" style={{ color: 'red' }}>
            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">{t('ADMIN.CARDS.EVENT.TITLE')}</div>
                        <div className="card-body">
                            <p>{t('ADMIN.CARDS.EVENT.SUBTITLE')}</p>
                            <Link to="/event-panel" style={{ backgroundColor: '#980100', border: '#980100' }} className="btn btn-success btn-block">{t('ADMIN.CARDS.EVENT.BUTTON')}</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">{t('ADMIN.CARDS.AUDIT.TITLE')}</div>
                        <div className="card-body">
                            <p>{t('ADMIN.CARDS.AUDIT.SUBTITLE')}</p>
                            <Link to="/audit-panel" style={{ backgroundColor: '#980100', border: '#980100' }} className="btn btn-success btn-block">{t('ADMIN.CARDS.AUDIT.BUTTON')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
