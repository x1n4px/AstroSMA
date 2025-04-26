import { useTranslation } from 'react-i18next';

export const useLogicDistance = () => {
       const { t } = useTranslation(['text']);

    const getDistanceLabel = (value) => {
        if (value <= 2) return t('DISTANCE.VERYFAR');
        if (value <= 4) return t('DISTANCE.FAR');
        if (value <= 6) return t('DISTANCE.CLOSE');
        if (value <= 8) return t('DISTANCE.VERYCLOSE');
        return t('DISTANCE.EXACT');
    };

    return { getDistanceLabel };
};
