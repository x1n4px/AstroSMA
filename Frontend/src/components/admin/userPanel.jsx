import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { getAllUsers, modifyUserRol } from '../../services/userService';
import { useTranslation } from 'react-i18next';
import BackToAdminPanel from './BackToAdminPanel'; // Asegúrate de que la ruta sea correcta


import { QR_USER_ROL, BASIC_USER_ROL, ADMIN_USER_ROL } from '@/utils/roleMaskUtils';


const getRoleLabel = (mask, t) => {
    switch (mask) {
        case ADMIN_USER_ROL:
            return t('ROL.ADMIN');
        case BASIC_USER_ROL:
            return t('ROL.USER');
        case QR_USER_ROL:
            return t('ROL.GUEST');
        default:
            return t('ROL.UNKNOWN');
    }
};


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

    // Cambia el estado de edición para un usuario
    const enableEdit = (userId) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, editing: true, newRol: user.rol } : user
            )
        );
    };

    const cancelEdit = (userId) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, editing: false } : user
            )
        );
    };

    const handleRoleChange = (userId, newRol) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, newRol } : user
            )
        );
    };

    const saveRoleChange = async (userId) => {
        const userToUpdate = users.find(u => u.id === userId);
        try {
            await modifyUserRol(userId, userToUpdate.newRol);
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, rol: user.newRol, editing: false }
                        : user
                )
            );
        } catch (err) {
            console.error('Error updating role');
        }
    };


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
                            <th>{t('ADMIN.USER_PAGE.TABLE.ROL')}</th>
                        </tr>
                    </thead>
                    <tbody>
  {users.length > 0 ? (
    users.map((user) => {
      const isEditing = user.editing;
      return (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.email}</td>
          <td>{user.name || '-'}</td>
          <td>{user.surname || '-'}</td>
          <td>{user.institucion || '-'}</td>
          <td>{user.countryName}</td>
          <td>
            {isEditing ? (
              <select
              value={user.newRol}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
            
                <option value={ADMIN_USER_ROL}>{t('ROL.ADMIN')}</option>
                <option value={BASIC_USER_ROL}>{t('ROL.USER')}</option>
              </select>
            ) : (
              getRoleLabel(user.rol, t)
            )}
          </td>
          <td>
            {isEditing ? (
              <>
                <button  className="btn btn-success btn-sm me-2" onClick={() => saveRoleChange(user.id)}>Guardar</button>
                <button className="btn btn-secondary btn-sm" onClick={() => cancelEdit(user.id)}>Cancelar</button>
              </>
            ) : (
              <button style={{backgroundColor: '#980100', borderColor: '#980100'}} className="btn btn-primary btn-sm" onClick={() => enableEdit(user.id)}>Modificar</button>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="8" className="text-center">No users found</td>
    </tr>
  )}
</tbody>

                </Table>
            </div>
        </div>
    );
};

export default UserPanel;