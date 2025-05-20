import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom'; // useNavigate was not used
import { useTranslation } from 'react-i18next';
// Import icons (example: Font Awesome icons)
import { FaCalendarAlt, FaClipboardList, FaCogs, FaUsers, FaChargingStation } from 'react-icons/fa';

const AdminPanel = () => {
    const { t } = useTranslation(['text']); // i18n was not used

    const cardSections = [
        {
            key: 'EVENT',
            icon: <FaCalendarAlt className="me-2" />,
            link: "/admin-panel/event-panel"
        },
        {
            key: 'AUDIT',
            icon: <FaClipboardList className="me-2" />,
            link: "/admin-panel/audit-panel"
        },
        {
            key: 'CONFIG',
            icon: <FaCogs className="me-2" />,
            link: "/admin-panel/config-panel"
        },
        {
            key: 'USER',
            icon: <FaUsers className="me-2" />,
            link: "/admin-panel/user-panel"
        },
        {
            key: 'STATION',
            icon: <FaChargingStation className="me-2" />,
            link: "/admin-panel/station-panel"
        }
    ];

    return (
        // <div className="container mt-5 mb-5" style={{ color: 'red' }}>
        <div className="container mt-5 mb-5">
            <h2 className="mb-4 text-center">{t('ADMIN.PANEL_TITLE', 'Admin Panel')}</h2> {/* Added a general title for the panel */}
            <div className="row">
                {cardSections.map((section, index) => (
                    <div className="col-md-6 col-lg-4 mb-4" key={section.key}> {/* Adjusted column for better responsiveness (lg-4 for 3 cards per row on large screens) */}
                        <div className="card h-100 shadow-sm"> {/* Added h-100 for equal height cards and a subtle shadow */}
                            <div className="card-header d-flex align-items-center"> {/* Used flex to align icon and title */}
                                {section.icon}
                                <h5 className="mb-0">{t(`ADMIN.CARDS.${section.key}.TITLE`)}</h5>
                            </div>
                            <div className="card-body d-flex flex-column"> {/* Used flex to push button to bottom if content is short */}
                                <p className="card-text">{t(`ADMIN.CARDS.${section.key}.SUBTITLE`)}</p>
                                <Link 
                                    to={section.link} 
                                    style={{ backgroundColor: '#980100', border: '#980100' }} 
                                    className="btn btn-primary btn-block mt-auto w-100" // Changed to btn-primary for better contrast with red, mt-auto to push to bottom, w-100
                                >
                                    {t(`ADMIN.CARDS.${section.key}.BUTTON`)}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;