export const templates = {
    'meteor-detection': {
        name: 'Meteor Detection Report',
        template: 'A las ${hour} ha sido detectado un bólido por la Red de la Universidad de Málaga y de la Sociedad Malagueña de astronomía. En concreto fue grabado en vídeo por las estaciones de ${stations}.',
        variables: [
            { name: 'hour', query: 'getMeteorHour', field: 'hour' },
            { name: 'stations', query: 'getObservatoriesWithCredits', field: 'stations' }
        ]
    },
    'meteor-detailed-report': {
        name: 'Meteor Detailed Report',
        template: 'El ${date} a las ${hour} fue detectado un bólido por la Red de la Universidad de Málaga y de la Sociedad Malagueña de astronomía. Las estaciones de ${stations} capturaron el evento en vídeo. El meteoro alcanzó una magnitud máxima de ${max_mag} y una mínima de ${min_mag}, con una masa fotométrica estimada de ${mass}.',
        variables: [
            { name: 'date', query: 'getMeteorDate', field: 'date' },
            { name: 'hour', query: 'getMeteorHour', field: 'hour' },
            { name: 'stations', query: 'getObservatoriesWithCredits', field: 'stations' },
            { name: 'max_mag', query: 'getPhotometryData', field: 'MagMax' },
            { name: 'min_mag', query: 'getPhotometryData', field: 'MagMin' },
            { name: 'mass', query: 'getPhotometryData', field: 'Masa_fotometrica' }
        ]
    }
};
