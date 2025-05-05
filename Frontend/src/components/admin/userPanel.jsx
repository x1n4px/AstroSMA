import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { getAllUsers } from '../../services/userService';
import { useTranslation } from 'react-i18next';
import BackToAdminPanel from './BackToAdminPanel'; // Asegúrate de que la ruta sea correcta

const UserPanel = () => {
    const { t, i18n } = useTranslation(['text']);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await getAllUsers();
                console.log('Users fetched:', response);
                setUsers(response.data || response); // Asegura compatibilidad con diferentes formatos de respuesta
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again later.');
                setUsers([]); // Limpia los usuarios en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // Array de dependencias vacío para que solo se ejecute una vez

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <div>
            <BackToAdminPanel />
            <div className="container mt-4">
                <h2 className="mb-4">{t('ADMIN.USER_PAGE.TITLE')}</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>{t('ADMIN.USER_PAGE.TABLE.ID')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.EMAIL')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.NAME')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.SURNAME')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.INSTITUTION')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.COUNTRY')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.name || '-'}</td>
                                    <td>{user.surname || '-'}</td>
                                    <td>{user.institucion || '-'}</td>
                                    <td>{user.countryName}</td> {/* Corregido typo en country */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default UserPanel;