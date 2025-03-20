import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container } from 'react-bootstrap'

const Videos = ({link}) => {

    

    const fullLink = "https://www.youtube.com/embed/" + link;

    return (
        <div>
            {link &&
            <Container>
                <div className="ratio ratio-16x9">
                    <iframe src={fullLink} title="Youtube video" allowFullScreen></iframe>
                </div>
            </Container>
        }
        </div>
    )
};

export default Videos;