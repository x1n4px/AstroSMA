const mongoose = require('mongoose');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

// Definir el modelo de vacaciones
const Vacation = sequelize.define('Vacation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',  // Nombre de la tabla relacionada (asegurate que sea correcto)
        key: 'id'            // Columna de la clave primaria de la tabla empleados
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW
    }
  }, {
    tableName: 'vacations',  // Nombre de la tabla
    timestamps: false,       // Si no quieres que Sequelize gestione automáticamente `created_at` y `updated_at`
  });
  
  // Relación entre `vacation` y `employee`
  Vacation.associate = (models) => {
    Vacation.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE'
    });
  };
  
  module.exports = Vacation;