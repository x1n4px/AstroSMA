const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("TrayectoriaPorRegresion", {
    Fecha: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Hora: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    t: {
      type: DataTypes.DECIMAL(8, 5),
      allowNull: false,
      primaryKey: true
    },
    s: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: true
    },
    v_Kms: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true
    },
    v_Pixs: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true
    },
    Informe_Z_IdInforme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: "Trayectoria_por_regresion",
    schema: "astro",
    timestamps: false
  });
};
