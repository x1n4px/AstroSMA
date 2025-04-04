const formatShowerState = (state) => {
    switch (state) {
        case '1':
            return 'established';
        case '0':
            return 'nominated';
        default:
            return 'nothing';
    }
};

export default formatShowerState;