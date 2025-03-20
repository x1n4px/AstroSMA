import React from 'react';
import { Container, Table } from 'react-bootstrap';
import GlobeWithObject from '@/components/three/GlobeWithObject.jsx';

const OrbitReport = ({ orbit }) => {
    console.log(orbit);
    const data = orbit[0];

    return (
        <Container>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Clave</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([key, value], index) => (
                        <tr key={index}>
                            <td>{key.replace(/_/g, ' ')}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div style={{ width: '100%', height: '80vh' }}>
                <GlobeWithObject orbitalElements={orbit[0]} />
            </div>
        </Container>
    );
};

export default OrbitReport;