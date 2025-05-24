const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const LluviaActiva = sequelize.define("LluviaActiva", {
        Distancia_mínima_entre_radianes_y_trayectoria: DataTypes.FLOAT,
        Lluvia_Identificador: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        Lluvia_Año: {
          type: DataTypes.INTEGER,
          primaryKey: true
        },
        Informe_Z_IdInforme: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        }
      }, {
        tableName: "Lluvia_activa",
        schema: "astro",
        timestamps: false
      });
      

  return LluviaActiva;
};
