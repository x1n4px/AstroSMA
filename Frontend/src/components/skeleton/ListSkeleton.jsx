import React from 'react';
import { ListGroup, Placeholder } from 'react-bootstrap';

const ListSkeleton = ({ items = 4 }) => {
    return (
        <ListGroup>
            {Array.from({ length: items }).map((_, i) => (
                <ListGroup.Item key={i}>
                    <Placeholder as="p" animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ListSkeleton;