const { Model, DataTypes } = require('sequelize');

class Demo extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      value: {
        type: DataTypes.INTEGER
      }
    }, {
      sequelize,
      modelName: 'Demo',
      tableName: 'demo',
      timestamps: false
    });
  }
}

module.exports = { Demo };