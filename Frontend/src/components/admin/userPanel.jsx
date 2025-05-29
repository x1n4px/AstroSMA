import React, { useEffect, useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import { getAllUsers, modifyUserRol, blockUser, unblockUser } from '../../services/userService';
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

    // Estados para el modal de bloqueo
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    const [userToBlock, setUserToBlock] = useState(null);
    const [userToUnblock, setUserToUnblock] = useState(null);
    const [blockingUser, setBlockingUser] = useState(false);
    const [unblockingUser, setUnblockingUser] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await getAllUsers();
                setUsers(response.data || response); // Asegura compatibilidad con diferentes formatos de respuesta
                setError(null);
            } catch (err) {
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

    // Cambia el estado de edición para un usuario (solo si no está bloqueado)
    const enableEdit = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user && user.blocked) {
            return; // No permitir edición si el usuario está bloqueado
        }

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

    // Funciones para el modal de bloqueo
    const handleBlockClick = (user) => {
        setUserToBlock(user);
        setShowBlockModal(true);
    };

    const handleCloseBlockModal = () => {
        setShowBlockModal(false);
        setUserToBlock(null);
        setBlockingUser(false);
    };

    const handleConfirmBlock = async () => {
        if (!userToBlock) return;

        try {
            setBlockingUser(true);
            await blockUser(userToBlock.id);

            // Actualizar el usuario en la lista marcándolo como bloqueado
            setUsers(prev =>
                prev.map(user =>
                    user.id === userToBlock.id
                        ? { ...user, is_blocked: true, editing: false }
                        : user
                )
            );

            handleCloseBlockModal();
        } catch (err) {
            console.error('Error blocking user:', err);
            // Aquí podrías mostrar un mensaje de error al usuario
        } finally {
            setBlockingUser(false);
        }
    };

    // Funciones para el modal de desbloqueo
    const handleUnblockClick = (user) => {
        setUserToUnblock(user);
        setShowUnblockModal(true);
    };

    const handleCloseUnblockModal = () => {
        setShowUnblockModal(false);
        setUserToUnblock(null);
        setUnblockingUser(false);
    };

    const handleConfirmUnblock = async () => {
        if (!userToUnblock) return;

        try {
            setUnblockingUser(true);
            await blockUser(userToUnblock.id);

            // Actualizar el usuario en la lista marcándolo como desbloqueado
            setUsers(prev =>
                prev.map(user =>
                    user.id === userToUnblock.id
                        ? { ...user, is_blocked: false }
                        : user
                )
            );

            handleCloseUnblockModal();
        } catch (err) {
            console.error('Error unblocking user:', err);
            // Aquí podrías mostrar un mensaje de error al usuario
        } finally {
            setUnblockingUser(false);
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
                            {/* <th>{t('ADMIN.USER_PAGE.TABLE.ID')}</th> */}
                            <th>{t('ADMIN.USER_PAGE.TABLE.EMAIL')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.NAME')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.SURNAME')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.INSTITUTION')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.COUNTRY')}</th>
                            <th>{t('ADMIN.USER_PAGE.TABLE.ROL')}</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => {
                                const isEditing = user.editing;
                                const isBlocked = user.is_blocked;
                                return (
                                    <tr key={user.id} className={isBlocked ? 'table-secondary' : ''}>
                                        {/* <td>{user.id}</td> */}
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
                                            {isBlocked ? (
                                                <span className="badge bg-danger">Bloqueado</span>
                                            ) : (
                                                <span className="badge bg-success">Activo</span>
                                            )}
                                        </td>
                                        <td>
                                            {isBlocked ? (
                                                // Usuario bloqueado - solo mostrar botón de desbloquear
                                                <button
                                                    style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleUnblockClick(user)}
                                                >
                                                    Desbloquear
                                                </button>
                                            ) : isEditing ? (
                                                // Usuario en modo edición
                                                <>
                                                    <button className="btn btn-success btn-sm me-2" onClick={() => saveRoleChange(user.id)}>Guardar</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => cancelEdit(user.id)}>Cancelar</button>
                                                </>
                                            ) : (
                                                // Usuario activo - mostrar botones de modificar y bloquear
                                                <>
                                                    <button
                                                        style={{ backgroundColor: '#980100', borderColor: '#980100', marginRight: '2px' }}
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => enableEdit(user.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{ fill: "white" }}><path d="M8.707 19.707 18 10.414 13.586 6l-9.293 9.293a1.003 1.003 0 0 0-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263zM21 7.414a2 2 0 0 0 0-2.828L19.414 3a2 2 0 0 0-2.828 0L15 4.586 19.414 9 21 7.414z"></path></svg>

                                                        Modificar
                                                    </button>
                                                    <button
                                                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleBlockClick(user)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                            fill="currentColor" viewBox="0 0 24 24" >
                                                            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2M4 12c0-1.85.63-3.54 1.69-4.9L16.9 18.31A8 8 0 0 1 12 20c-4.41 0-8-3.59-8-8m14.31 4.9L7.1 5.69A8 8 0 0 1 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.54-1.69 4.9"></path>
                                                        </svg>
                                                        Bloquear
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal de confirmación para bloquear usuario */}
            <Modal show={showBlockModal} onHide={handleCloseBlockModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Bloqueo de Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>¿Está seguro de que desea bloquear al usuario?</strong>
                    </div>
                    {userToBlock && (
                        <div className="mb-3">
                            <p><strong>Usuario:</strong> {userToBlock.name} {userToBlock.surname}</p>
                            <p><strong>Email:</strong> {userToBlock.email}</p>
                        </div>
                    )}
                    <div className="alert alert-warning">
                        <strong>Advertencia:</strong> Al bloquear este usuario, se inhabilitará completamente su acceso al sistema.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseBlockModal} disabled={blockingUser}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmBlock}
                        disabled={blockingUser}
                    >
                        {blockingUser ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación para desbloquear usuario */}
            <Modal show={showUnblockModal} onHide={handleCloseUnblockModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Desbloqueo de Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>¿Está seguro de que desea desbloquear al usuario?</strong>
                    </div>
                    {userToUnblock && (
                        <div className="mb-3">
                            <p><strong>Usuario:</strong> {userToUnblock.name} {userToUnblock.surname}</p>
                            <p><strong>Email:</strong> {userToUnblock.email}</p>
                        </div>
                    )}
                    <div className="alert alert-info">
                        <strong>Información:</strong> Al desbloquear este usuario, recuperará completamente su acceso al sistema.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseUnblockModal} disabled={unblockingUser}>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleConfirmUnblock}
                        disabled={unblockingUser}
                    >
                        {unblockingUser ? 'Desbloqueando...' : 'Confirmar Desbloqueo'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserPanel;