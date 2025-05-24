const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Meteoro = sequelize.define("Meteoro", {
    Identificador: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    Fecha: DataTypes.STRING,
    Hora: DataTypes.STRING
  }, {
    tableName: "Meteoro",
    timestamps: false,
    schema: "astro"
  });

  return Meteoro;
};
