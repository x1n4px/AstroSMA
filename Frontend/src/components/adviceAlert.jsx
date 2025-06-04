import React from 'react';
import { Alert, Button } from 'react-bootstrap';


const AdviceAlert = ({ tabKey, adviceData, onRemoveAdvice, rol }) => {
    const adviceList = adviceData.filter(advice => 
        advice.Tab === tabKey && advice.status == '1'
    );
    
    return (
        <>
            {adviceList.map(advice => (
                <Alert key={advice.Id} variant="warning" className="d-flex justify-content-between align-items-center">
                    <div>
                        ID: {advice.Id} - {advice.Description}
                    </div>
                        <div>
                            <Button 
                                style={{ backgroundColor: 'transparent', border: 'transparent' }} 
                                onClick={() => onRemoveAdvice(advice.Id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ fill: "rgba(0, 0, 0, 1);" }}>
                                    <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
                                    <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                                </svg>
                            </Button>
                        </div>
                </Alert>
            ))}
        </>
    );
};
export default AdviceAlert;