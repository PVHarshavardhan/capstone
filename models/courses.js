'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
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
  Courses.init({
    coursename: DataTypes.STRING,
    author: DataTypes.STRING,
    chapter: DataTypes.STRING,
    chapterdescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Courses',
  });
  return Courses;
};