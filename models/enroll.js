'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getEnrollStatus(userid,coursename) {
      return this.findAll({where:{ userid, coursename}})
    }
  }
  Enroll.init({
    userid: DataTypes.INTEGER,
    coursename: DataTypes.STRING,
    enroll: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Enroll',
  });
  return Enroll;
};