const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ReportZ = sequelize.define("ReportZ", {
    IdInforme: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    Observatorio_Número2: DataTypes.INTEGER,
    Observatorio_Número: DataTypes.INTEGER,
    Fecha: DataTypes.STRING,
    Hora: DataTypes.STRING,
    Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_1: DataTypes.STRING,
    Error_cuadrático_de_ortogonalidad_en_la_esfera_celeste_2: DataTypes.STRING,
    Fotogramas_usados: DataTypes.STRING,
    Ajuste_estación_2_Inicio: DataTypes.STRING,
    Ajuste_estación_2_Final: DataTypes.STRING,
    Ángulo_diedro_entre_planos_trayectoria: DataTypes.STRING,
    Peso_estadístico: DataTypes.STRING,
    Errores_AR_DE_radiante: DataTypes.STRING,
    Coordenadas_astronómicas_del_radiante_Eclíptica_de_la_fecha: DataTypes.STRING,
    Coordenadas_astronómicas_del_radiante_J200: DataTypes.STRING,
    Azimut: DataTypes.STRING,
    Dist_Cenital: DataTypes.STRING,
    Inicio_de_la_trayectoria_Estacion_1: DataTypes.STRING,
    Fin_de_la_trayectoria_Estacion_1: DataTypes.STRING,
    Inicio_de_la_trayectoria_Estacion_2: DataTypes.STRING,
    Fin_de_la_trayectoria_Estacion_2: DataTypes.STRING,
    Impacto_previsible: DataTypes.STRING,
    Distancia_recorrida_Estacion_1: DataTypes.STRING,
    Error_distancia_Estacion_1: DataTypes.STRING,
    Error_alturas_Estacion_1: DataTypes.STRING,
    Distancia_recorrida_Estacion_2: DataTypes.STRING,
    Error_distancia_Estacion_2: DataTypes.STRING,
    Error_alturas_Estacion_2: DataTypes.STRING,
    Tiempo_Estacion_1: DataTypes.STRING,
    Velocidad_media: DataTypes.STRING,
    Tiempo_trayectoria_en_estacion_2: DataTypes.STRING,
    Ecuacion_del_movimiento_en_Kms: DataTypes.STRING,
    Ecuacion_del_movimiento_en_gs: DataTypes.STRING,
    Error_Velocidad: DataTypes.STRING,
    Velocidad_Inicial_Estacion_2: DataTypes.STRING,
    Aceleración_en_Kms: DataTypes.STRING,
    Aceleración_en_gs: DataTypes.STRING,
    Método_utilizado: DataTypes.STRING,
    Ruta_del_informe: DataTypes.STRING,
    Ecuacion_parametrica_IdEc: DataTypes.INTEGER,
    Meteoro_Identificador: DataTypes.INTEGER
  }, {
    tableName: "Informe_Z",
    timestamps: false,
    schema: "astro"
  });

  return ReportZ;
};
