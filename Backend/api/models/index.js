const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("astro", "in4p", "0000", {
    host: "localhost",
    dialect: "mariadb"
});

const ReportZ = require("./ReportZ")(sequelize);
const Meteoro = require("./Meteoro")(sequelize);
const Observatorio = require("./Observatorio")(sequelize);
const LluviaActiva = require("./LluviaActiva")(sequelize);
const ElementosOrbitales = require("./ElementosOrbitales")(sequelize);
const PuntosZWO = require("./PuntosZWO")(sequelize);
const TrayectoriaMedida = require("./TrayectoriaMedida")(sequelize);
const TrayectoriaPorRegresion = require("./TrayectoriaPorRegresion")(sequelize);


ReportZ.belongsTo(Meteoro, {
    foreignKey: "Meteoro_Identificador",
    targetKey: "Identificador"
});
ReportZ.belongsTo(Observatorio, {
    foreignKey: "Observatorio_Número",
    targetKey: "Número",
    as: "Observatorio1"
});
ReportZ.belongsTo(Observatorio, {
    foreignKey: "Observatorio_Número2",
    targetKey: "Número",
    as: "Observatorio2"
});
Meteoro.hasMany(ReportZ, {
    foreignKey: "Meteoro_Identificador",
    sourceKey: "Identificador"
});
Observatorio.hasMany(ReportZ, {
    foreignKey: "Observatorio_Número",
    sourceKey: "Número",
    as: "ReportesComoObservatorio1"

});
Observatorio.hasMany(ReportZ, {
    foreignKey: "Observatorio_Número2",
    sourceKey: "Número",
    as: "ReportesComoObservatorio2"

});


//Lluvia activa 
ReportZ.hasMany(LluviaActiva, {
    foreignKey: "Informe_Z_IdInforme",
    sourceKey: "IdInforme"
});
LluviaActiva.belongsTo(ReportZ, {
    foreignKey: "Informe_Z_IdInforme",
    targetKey: "IdInforme"
});


//Elemento orbitales
ReportZ.hasMany(ElementosOrbitales, {
    foreignKey: "Informe_Z_IdInforme",
    sourceKey: "IdInforme"
});
ElementosOrbitales.belongsTo(ReportZ, {
    foreignKey: "Informe_Z_IdInforme",
    targetKey: "IdInforme"
});

//Puntos ZWO
ReportZ.hasMany(PuntosZWO, {
    foreignKey: "Informe_Z_IdInforme",
    sourceKey: "IdInforme"
});
PuntosZWO.belongsTo(ReportZ, {
    foreignKey: "Informe_Z_IdInforme",
    targetKey: "IdInforme"
});

//Trayectoria medida
ReportZ.hasMany(TrayectoriaMedida, {
    foreignKey: "Informe_Z_IdInforme",
    sourceKey: "IdInforme"
});
TrayectoriaMedida.belongsTo(ReportZ, {
    foreignKey: "Informe_Z_IdInforme",
    targetKey: "IdInforme"
});

ReportZ.hasMany(TrayectoriaPorRegresion, {
    foreignKey: "Informe_Z_IdInforme"
  });
  TrayectoriaPorRegresion.belongsTo(ReportZ, {
    foreignKey: "Informe_Z_IdInforme"
  });
  

module.exports = { 
    sequelize, 
    ReportZ, 
    Meteoro, 
    Observatorio, 
    LluviaActiva, 
    ElementosOrbitales, 
    PuntosZWO, 
    TrayectoriaMedida,
    TrayectoriaPorRegresion
};
