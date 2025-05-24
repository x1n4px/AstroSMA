const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("PuntosZWO", {
    Fecha: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Hora: {
      type: DataTypes.STRING,
      allowNull: true
    },
    X: {
      type: DataTypes.DECIMAL(9, 4),
      primaryKey: true
    },
    Y: {
      type: DataTypes.DECIMAL(9, 4),
      primaryKey: true
    },
    Ar_Grados: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true
    },
    De_Grados: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true
    },
    Ar_Sexagesimal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    De_Sexagesimal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Informe_Z_IdInforme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: "Puntos_ZWO",
    schema: "astro",
    timestamps: false
  });
};
