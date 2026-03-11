/* eslint-disable */
// prettier-ignore-file
const queries = {
    // Basic meteor queries
    getMeteors: "SELECT * FROM Meteoro WHERE Fecha BETWEEN '${startDate}' AND '${endDate}' ORDER BY Fecha, Hora;",
    getMeteorById: "SELECT * FROM Meteoro WHERE Identificador = ${meteorId};",
    getAllMeteors: "SELECT * FROM Meteoro ORDER BY Fecha DESC, Hora DESC;",

    // ========== TRAJECTORY ANALYSIS QUERIES ==========
    acceleration: "SELECT `Aceleración_en_Kms` FROM Informe_Z WHERE `Aceleración_en_Kms` IS NOT NULL LIMIT 20;",
    avgSpeed: "SELECT Velocidad_media FROM Informe_Z WHERE Velocidad_media IS NOT NULL LIMIT 20;",
    meteorVelocity: "SELECT Velocidad_media FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Velocidad_media IS NOT NULL;",
    meteorAcceleration: "SELECT `Aceleración_en_Kms` FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND `Aceleración_en_Kms` IS NOT NULL;",
    distanceVsVelocity: "SELECT Distancia_recorrida_Estacion_1 as distance, Velocidad_media as velocity FROM Informe_Z WHERE Distancia_recorrida_Estacion_1 IS NOT NULL AND Velocidad_media IS NOT NULL LIMIT 20;",
    meteorDistanceVsVelocity: "SELECT Distancia_recorrida_Estacion_1 as distance, Velocidad_media as velocity FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Distancia_recorrida_Estacion_1 IS NOT NULL AND Velocidad_media IS NOT NULL;",
    trajectoryTime: "SELECT t, v_Kms as velocity FROM Trayectoria_por_regresion WHERE v_Kms IS NOT NULL ORDER BY t LIMIT 20;",
    meteorTrajectoryTime: "SELECT t, v_Kms as velocity FROM Trayectoria_por_regresion tpr JOIN Informe_Z iz ON tpr.Informe_Z_IdInforme = iz.IdInforme WHERE iz.Meteoro_Identificador = ${meteorId} AND tpr.v_Kms IS NOT NULL ORDER BY t;",
    trajectoryDistance: "SELECT t, s as distance FROM Trayectoria_por_regresion WHERE s IS NOT NULL ORDER BY t LIMIT 20;",
    meteorTrajectoryDistance: "SELECT t, s as distance FROM Trayectoria_por_regresion tpr JOIN Informe_Z iz ON tpr.Informe_Z_IdInforme = iz.IdInforme WHERE iz.Meteoro_Identificador = ${meteorId} AND tpr.s IS NOT NULL ORDER BY t;",
    accelerationTime: "SELECT Tiempo_Estacion_1 as t, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE `Aceleración_en_Kms` IS NOT NULL ORDER BY Tiempo_Estacion_1 LIMIT 20;",
    meteorAccelerationTime: "SELECT Tiempo_Estacion_1 as t, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND `Aceleración_en_Kms` IS NOT NULL ORDER BY Tiempo_Estacion_1;",

    // ========== PHOTOMETRIC ANALYSIS QUERIES ==========
    lightCurve: "SELECT t, Mc as magnitude FROM Puntos_del_ajuste WHERE Mc IS NOT NULL ORDER BY t LIMIT 30;",
    meteorLightCurve: "SELECT pa.t, pa.Mc as magnitude FROM Puntos_del_ajuste pa JOIN Informe_Fotometria ifoto ON pa.Informe_Fotometria_Identificador = ifoto.Identificador WHERE ifoto.Meteoro_Identificador = ${meteorId} AND pa.Mc IS NOT NULL ORDER BY pa.t;",
    magnitudeDistance: "SELECT Dist as distance, Mc as magnitude FROM Puntos_del_ajuste WHERE Dist IS NOT NULL AND Mc IS NOT NULL ORDER BY Dist LIMIT 30;",
    meteorMagnitudeDistance: "SELECT pa.Dist as distance, pa.Mc as magnitude FROM Puntos_del_ajuste pa JOIN Informe_Fotometria ifoto ON pa.Informe_Fotometria_Identificador = ifoto.Identificador WHERE ifoto.Meteoro_Identificador = ${meteorId} AND pa.Dist IS NOT NULL AND pa.Mc IS NOT NULL ORDER BY pa.Dist;",
    photometricMass: "SELECT MagMax, Masa_fotometrica as mass FROM Informe_Fotometria WHERE MagMax IS NOT NULL AND Masa_fotometrica IS NOT NULL LIMIT 20;",
    meteorPhotometricMass: "SELECT MagMax, Masa_fotometrica as mass FROM Informe_Fotometria WHERE Meteoro_Identificador = ${meteorId} AND MagMax IS NOT NULL AND Masa_fotometrica IS NOT NULL;",

    // ========== ERROR ANALYSIS QUERIES ==========
    velocityError: "SELECT Velocidad_media as velocity, Error_Velocidad as error FROM Informe_Z WHERE Velocidad_media IS NOT NULL AND Error_Velocidad IS NOT NULL LIMIT 20;",
    meteorVelocityError: "SELECT Velocidad_media as velocity, Error_Velocidad as error FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Velocidad_media IS NOT NULL AND Error_Velocidad IS NOT NULL;",
    distanceError: "SELECT Distancia_recorrida_Estacion_1 as distance, Error_distancia_Estacion_1 as error FROM Informe_Z WHERE Distancia_recorrida_Estacion_1 IS NOT NULL AND Error_distancia_Estacion_1 IS NOT NULL LIMIT 20;",
    meteorDistanceError: "SELECT Distancia_recorrida_Estacion_1 as distance, Error_distancia_Estacion_1 as error FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Distancia_recorrida_Estacion_1 IS NOT NULL AND Error_distancia_Estacion_1 IS NOT NULL;",
    photometricError: "SELECT MagMax, Error_tipico_regresion as error FROM Informe_Fotometria WHERE MagMax IS NOT NULL AND Error_tipico_regresion IS NOT NULL LIMIT 20;",
    meteorPhotometricError: "SELECT MagMax, Error_tipico_regresion as error FROM Informe_Fotometria WHERE Meteoro_Identificador = ${meteorId} AND MagMax IS NOT NULL AND Error_tipico_regresion IS NOT NULL;",

    // ========== ANGULAR ANALYSIS QUERIES ==========
    angularVelocity: "SELECT Distancia_angular_grados as angular_distance, Velocidad_angular_grad_sec as angular_velocity FROM Informe_Radiante WHERE Distancia_angular_grados IS NOT NULL AND Velocidad_angular_grad_sec IS NOT NULL LIMIT 20;",
    meteorAngularVelocity: "SELECT Distancia_angular_grados as angular_distance, Velocidad_angular_grad_sec as angular_velocity FROM Informe_Radiante WHERE Meteoro_Identificador = ${meteorId} AND Distancia_angular_grados IS NOT NULL AND Velocidad_angular_grad_sec IS NOT NULL;",
    showerVelocity: "SELECT Velocidad_Lluvia_Asociada as shower_velocity, Velocidad_angular_grad_sec as measured_velocity FROM Informe_Radiante WHERE Velocidad_Lluvia_Asociada IS NOT NULL AND Velocidad_angular_grad_sec IS NOT NULL LIMIT 20;",
    meteorShowerVelocity: "SELECT Velocidad_Lluvia_Asociada as shower_velocity, Velocidad_angular_grad_sec as measured_velocity FROM Informe_Radiante WHERE Meteoro_Identificador = ${meteorId} AND Velocidad_Lluvia_Asociada IS NOT NULL AND Velocidad_angular_grad_sec IS NOT NULL;",

    // ========== TEMPORAL ANALYSIS QUERIES ==========
    dailyPattern: `SELECT HOUR(STR_TO_DATE(Hora, '%H:%i:%s')) as hour, COUNT(*) as count FROM Meteoro WHERE Hora IS NOT NULL AND Hora REGEXP '^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}' GROUP BY HOUR(STR_TO_DATE(Hora, '%H:%i:%s')) ORDER BY hour;`,
    dailyPatternDebug: `SELECT Hora, COUNT(*) as count FROM Meteoro WHERE Hora IS NOT NULL GROUP BY Hora ORDER BY count DESC LIMIT 10;`,
    monthlyPattern: "SELECT MONTH(DATE(CONVERT_TZ(Fecha, '+00:00', '+01:00'))) as month, COUNT(*) as count FROM Meteoro GROUP BY MONTH(DATE(CONVERT_TZ(Fecha, '+00:00', '+01:00'))) ORDER BY month;",
    velocityTimeOfDay: "SELECT HOUR(STR_TO_DATE(iz.Hora, '%H:%i:%s')) as hour, AVG(iz.Velocidad_media) as avg_velocity FROM Informe_Z iz WHERE iz.Hora IS NOT NULL AND iz.Velocidad_media IS NOT NULL GROUP BY HOUR(STR_TO_DATE(iz.Hora, '%H:%i:%s')) ORDER BY hour;",

    // ========== OBSERVATORY ANALYSIS QUERIES ==========
    observatoryVelocity: "SELECT o.Nombre_Observatorio as observatory, AVG(iz.Velocidad_media) as velocity FROM Informe_Z iz JOIN Observatorio o ON iz.`Observatorio_Número` = o.`Número` WHERE iz.Velocidad_media IS NOT NULL GROUP BY o.Nombre_Observatorio ORDER BY velocity DESC;",
    observatoryCount: "SELECT o.Nombre_Observatorio as observatory, COUNT(DISTINCT iz.Meteoro_Identificador) as meteor_count FROM Informe_Z iz JOIN Observatorio o ON iz.`Observatorio_Número` = o.`Número` GROUP BY o.Nombre_Observatorio ORDER BY meteor_count DESC;",
    observatoryAltitude: "SELECT o.Altitud as altitude, COUNT(DISTINCT iz.Meteoro_Identificador) as meteor_count FROM Informe_Z iz JOIN Observatorio o ON iz.`Observatorio_Número` = o.`Número` WHERE o.Altitud IS NOT NULL GROUP BY o.Altitud ORDER BY altitude;",

    // ========== ADVANCED CORRELATION QUERIES ==========
    velocityAcceleration: "SELECT Velocidad_media as velocity, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE Velocidad_media IS NOT NULL AND `Aceleración_en_Kms` IS NOT NULL LIMIT 20;",
    meteorVelocityAcceleration: "SELECT Velocidad_media as velocity, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Velocidad_media IS NOT NULL AND `Aceleración_en_Kms` IS NOT NULL;",
    distanceAcceleration: "SELECT Distancia_recorrida_Estacion_1 as distance, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE Distancia_recorrida_Estacion_1 IS NOT NULL AND `Aceleración_en_Kms` IS NOT NULL LIMIT 20;",
    meteorDistanceAcceleration: "SELECT Distancia_recorrida_Estacion_1 as distance, `Aceleración_en_Kms` as acceleration FROM Informe_Z WHERE Meteoro_Identificador = ${meteorId} AND Distancia_recorrida_Estacion_1 IS NOT NULL AND `Aceleración_en_Kms` IS NOT NULL;",

    // ========== EXISTING MAP AND SPECIALIZED QUERIES ==========
    getObservatoriesByMeteor: `SELECT DISTINCT o.\`Número\` as Numero, o.Nombre_Observatorio, o.Latitud_Sexagesimal, o.Longitud_Sexagesimal FROM Observatorio o WHERE o.\`Número\` IN ( SELECT iz.\`Observatorio_Número\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = \${meteorId} UNION SELECT iz.\`Observatorio_Número2\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = \${meteorId} AND iz.\`Observatorio_Número2\` IS NOT NULL UNION SELECT ir.\`Observatorio_Número\` FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador = \${meteorId});`,
    getTrajectoryData: `SELECT iz.Inicio_de_la_trayectoria_Estacion_1, iz.Fin_de_la_trayectoria_Estacion_1, iz.Inicio_de_la_trayectoria_Estacion_2, iz.Fin_de_la_trayectoria_Estacion_2, iz.Velocidad_media, iz.Distancia_recorrida_Estacion_1, iz.Distancia_recorrida_Estacion_2 FROM Informe_Z iz WHERE iz.Meteoro_Identificador = \${meteorId};`,
    getPhotometryData: `SELECT inf.MagMax, inf.MagMin, inf.Masa_fotometrica, inf.Error_tipico_regresion FROM Informe_Fotometria inf WHERE inf.Meteoro_Identificador = \${meteorId};`,
    getPhotometryPoints: `SELECT pa.t, pa.Mc, pa.Ma, pa.Dist FROM Puntos_del_ajuste pa JOIN Informe_Fotometria inf ON pa.Informe_Fotometria_Identificador = inf.Identificador WHERE inf.Meteoro_Identificador = \${meteorId} ORDER BY pa.t;`,
    getRadiantData: `SELECT ir.Lluvia_Asociada, ir.Velocidad_Lluvia_Asociada, ir.Distancia_angular_grados, ir.Velocidad_angular_grad_sec FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador = \${meteorId};`,
    getActiveObservatories: "SELECT * FROM Observatorio WHERE Activo = 1 ORDER BY Nombre_Observatorio;",

    // ========== METEOR SEARCH AND RETRIEVAL QUERIES ==========
    searchMeteorByDate: `SELECT DISTINCT m.* FROM Meteoro m WHERE DATE(CONVERT_TZ(m.Fecha, '+00:00', '+01:00')) = '\${fecha}' ORDER BY m.Hora`,
    searchMeteorByDateAndTime: `SELECT DISTINCT m.* FROM Meteoro m WHERE DATE(CONVERT_TZ(m.Fecha, '+00:00', '+01:00')) = '\${fecha}' AND m.Hora >= '\${horaInicio}' AND m.Hora <= '\${horaFin}' ORDER BY m.Hora`,
    searchMeteorByDateAndObservatory: `SELECT DISTINCT m.* FROM Meteoro m WHERE DATE(CONVERT_TZ(m.Fecha, '+00:00', '+01:00')) = '\${fecha}' AND (EXISTS (SELECT 1 FROM Informe_Z iz WHERE iz.Meteoro_Identificador = m.Identificador AND iz.\`Observatorio_Número\` = \${observatorio}) OR EXISTS (SELECT 1 FROM Informe_Z iz WHERE iz.Meteoro_Identificador = m.Identificador AND iz.\`Observatorio_Número2\` = \${observatorio}) OR EXISTS (SELECT 1 FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador = m.Identificador AND ir.\`Observatorio_Número\` = \${observatorio}) ) ORDER BY m.Hora`,

    // ========== TEMPLATE DATA QUERIES ==========
    getMeteorHour: `SELECT TIME_FORMAT(Hora, '%H:%i') as hour FROM Meteoro WHERE Identificador = \${meteorId};`,
    getMeteorDate: `SELECT SUBSTRING(Fecha, 1, 10) as date FROM Meteoro WHERE Identificador = \${meteorId};`,
    getObservatoriesWithCredits: `SELECT GROUP_CONCAT(DISTINCT CONCAT(o.Nombre_Observatorio, ' (', COALESCE(o.Creditos, 'N/A'), ')') SEPARATOR ', ') as stations FROM Observatorio o WHERE o.\`Número\` IN ( SELECT iz.\`Observatorio_Número\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = \${meteorId} UNION SELECT iz.\`Observatorio_Número2\` FROM Informe_Z iz WHERE iz.Meteoro_Identificador = \${meteorId} AND iz.\`Observatorio_Número2\` IS NOT NULL UNION SELECT ir.\`Observatorio_Número\` FROM Informe_Radiante ir WHERE ir.Meteoro_Identificador = \${meteorId});`
};

module.exports = {
    queries
};
