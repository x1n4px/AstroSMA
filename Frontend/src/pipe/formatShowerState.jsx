// En tu componente de React donde usas formatShowerState:
import React from 'react';


// Tu función formatShowerState modificada:
const formatShowerState = (state, t) => {
    switch (state) {
        case '1':
            return t('SHOWER_STATE.ACTIVE');
        case '0':
            return t('SHOWER_STATE.INACTIVE');
        default:
            return t('SHOWER_STATE.PENDING');
    }
};

export default formatShowerState;