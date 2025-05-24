const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ElementosOrbitales = sequelize.define("ElementosOrbitales", {
    Informe_Z_IdInforme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Calculados_con: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Vel__Inf: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Vel__Geo: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Ar: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    De: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    i: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    p: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    a: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    e: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    q: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    T: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    omega: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Omega_grados_votos_max_min: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: "Elementos_Orbitales",
    schema: "astro",
    timestamps: false
  });

  return ElementosOrbitales;
};
