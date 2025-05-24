const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Observatorio = sequelize.define("Observatorio", {
    Número: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    Nombre_Camara: DataTypes.STRING,
    Descripción: DataTypes.STRING,
    Longitud_Sexagesimal: DataTypes.STRING,
    Latitud_Sexagesimal: DataTypes.STRING,
    Longitud_Radianes: DataTypes.DOUBLE,
    Latitud_Radianes: DataTypes.DOUBLE,
    Altitud: DataTypes.INTEGER,
    Directorio_Local: DataTypes.STRING,
    Directorio_Nube: DataTypes.STRING,
    Tamaño_Chip: DataTypes.STRING,
    Orientación_Chip: DataTypes.STRING,
    Máscara: DataTypes.STRING,
    Créditos: DataTypes.STRING,
    Nombre_Observatorio: DataTypes.STRING,
    Activo: DataTypes.BOOLEAN
  }, {
    tableName: "Observatorio",
    schema: "astro",
    timestamps: false
  });

  return Observatorio;
};
