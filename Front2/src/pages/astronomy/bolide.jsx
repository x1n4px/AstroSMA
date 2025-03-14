import React from 'react';
import { useParams } from "react-router-dom";


function Bolide() {
    const params = useParams();
    const id = params?.bolideId || '-1'; // Asegura que id tenga un valor válido


    return (
        <div>
            <h1>Bolide Page</h1>
            <p>Welcome to the Bolide page!</p>
            <p>Bolide id:{id}</p>
        </div>
    );
};

export default Bolide;