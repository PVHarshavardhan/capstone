'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coursesall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getChapters(coursename) {
      return this.findAll({where:{coursename}})
    }
  }
  Coursesall.init({
    coursename: DataTypes.STRING,
    author: DataTypes.STRING,
    chapter: DataTypes.STRING,
    chapterdescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Coursesall',
  });
  return Coursesall;
};