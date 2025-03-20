import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserComponent = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:4000/user/1');
                setUser(response.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (!user) {
        return <p>Usuario no encontrado.</p>;
    }

    return (
        <div>
            <h2>Detalles del usuario</h2>
            <p>ID: {user.id}</p>
            <p>Nombre: {user.name}</p>
            <p>Correo electrónico: {user.email}</p>
            {/* Agrega aquí más detalles del usuario según sea necesario */}
        </div>
    );
};

export default UserComponent;