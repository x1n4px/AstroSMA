const EARTH_RADIUS_KM = 6371;

function getMaxObservatoryDistanceKm() {
    const configuredDistance = process.env.MAX_DISTANCE_OBSERVATORIO;

    if (configuredDistance === undefined || configuredDistance === null || configuredDistance === '') {
        return null;
    }

    const distance = Number.parseFloat(String(configuredDistance).trim().replace(',', '.'));
    return Number.isFinite(distance) && distance >= 0 ? distance : null;
}

function buildReportZVisibilityCondition(reportAlias = 'iz') {
    const maxDistanceKm = getMaxObservatoryDistanceKm();

    if (maxDistanceKm === null) {
        return '1=1';
    }

    // Observatorio keeps latitude in Longitud_Radianes and longitude in Latitud_Radianes.
    return `
        NOT EXISTS (
            SELECT 1
            FROM Observatorio report_z_observatory_1
            JOIN Observatorio report_z_observatory_2
              ON report_z_observatory_2.\`Número\` = ${reportAlias}.\`Observatorio_Número2\`
            WHERE report_z_observatory_1.\`Número\` = ${reportAlias}.\`Observatorio_Número\`
              AND report_z_observatory_1.Longitud_Radianes IS NOT NULL
              AND report_z_observatory_1.Latitud_Radianes IS NOT NULL
              AND report_z_observatory_2.Longitud_Radianes IS NOT NULL
              AND report_z_observatory_2.Latitud_Radianes IS NOT NULL
              AND ${EARTH_RADIUS_KM} * ACOS(
                LEAST(
                    1,
                    GREATEST(
                        -1,
                        COS(report_z_observatory_1.Longitud_Radianes)
                          * COS(report_z_observatory_2.Longitud_Radianes)
                          * COS(report_z_observatory_2.Latitud_Radianes - report_z_observatory_1.Latitud_Radianes)
                          + SIN(report_z_observatory_1.Longitud_Radianes)
                          * SIN(report_z_observatory_2.Longitud_Radianes)
                    )
                )
              ) <= ${maxDistanceKm}
        )
    `;
}

module.exports = {
    buildReportZVisibilityCondition,
    getMaxObservatoryDistanceKm
};
