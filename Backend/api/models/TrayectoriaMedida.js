const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("TrayectoriaMedida", {
    Fecha: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Hora: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    s: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true
    },
    t: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    v: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true
    },
    lambda: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AR_Estacion_1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    De_Estacion_1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Ar_Estacion_2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    De_Estacion_2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    X: {
      type: DataTypes.DECIMAL(9, 4),
      allowNull: true
    },
    Y: {
      type: DataTypes.DECIMAL(9, 4),
      allowNull: true
    },
    Pix: {
      type: DataTypes.DECIMAL(9, 4),
      allowNull: true
    },
    Pix_Seg: {
      type: DataTypes.DECIMAL(9, 4),
      allowNull: true
    },
    Informe_Z_IdInforme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: "Trayectoria_medida",
    schema: "astro",
    timestamps: false
  });
};
