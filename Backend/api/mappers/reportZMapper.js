const reportZMapper = {
    // --- Identificadores y Metadatos ---
    'IdInforme': 'reportId',
    'Fecha': 'date',
    'Hora': 'time',
    'Meteoro_Identificador': 'meteorId',
    'Ruta_del_informe': 'reportPath',
    'Método_utilizado': 'methodUsed',
    'Fotogramas_usados': 'usedFrames',
    'Peso_estadístico': 'statisticalWeight',
  
    // --- Observatorios ---
    'Observatorio_Número': 'observatoryNumber',
    'Observatorio_Número2': 'observatoryNumber2',
  
    // --- Radiante y Coordenadas ---
    'Errores_AR_DE_radiante': 'radiantRaDeErrors',
    'Coordenadas_astronómicas_del_radiante_J200': 'radiantJ2000Coordinates',
    'Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha': 'radiantEclipticCoordinatesOfDate',
    'Azimut': 'azimuth',
    'Dist_Cenital': 'zenithDistance',
  
    // --- Errores de Medición ---
    'Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1': 'celestialSphereOrthogonalityError1',
    'Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2': 'celestialSphereOrthogonalityError2',
    'Ángulo_diedro_entre_planos_trayectoria': 'trajectoryPlanesDihedralAngle',
    
    // --- Datos de la Estación 1 ---
    'Inicio_de_la_trayectoria_Estacion_1': 'trajectoryStartStation1',
    'Fin_de_la_trayectoria_Estacion_1': 'trajectoryEndStation1',
    'Distancia_recorrida_Estacion_1': 'distanceTraveledStation1',
    'Error_distancia_Estacion_1': 'distanceErrorStation1',
    'Error_alturas_Estacion_1': 'altitudeErrorStation1',
    'Tiempo_Estacion_1': 'timeStation1',
    
    // --- Datos de la Estación 2 ---
    'Ajuste_estación_2_Inicio': 'station2FitStart',
    'Ajuste_estación_2_Final': 'station2FitEnd',
    'Inicio_de_la_trayectoria_Estacion_2': 'trajectoryStartStation2',
    'Fin_de_la_trayectoria_Estacion_2': 'trajectoryEndStation2',
    'Distancia_recorrida_Estacion_2': 'distanceTraveledStation2',
    'Error_distancia_Estacion_2': 'distanceErrorStation2',
    'Error_alturas_Estacion_2': 'altitudeErrorStation2',
    'Tiempo_trayectoria_en_estacion_2': 'trajectoryTimeStation2',
    'Velocidad_Inicial_Estacion_2': 'initialVelocityStation2',
  
    // --- Velocidad y Aceleración ---
    'Velocidad_media': 'averageVelocity',
    'Error_Velocidad': 'velocityError',
    'Aceleración_en_Kms': 'accelerationKms',
    'Aceleración_en_gs': 'accelerationGs',
  
    // --- Ecuaciones y Predicciones ---
    'Ecuacion_del_movimiento_en_Kms': 'motionEquationKms',
    'Ecuacion_del_movimiento_en_gs': 'motionEquationGs',
    'Ecuacion_parametrica_IdEc': 'parametricEquationId',
    'Impacto_previsible': 'predictedImpact',
  };
  
  module.exports = { reportZMapper };