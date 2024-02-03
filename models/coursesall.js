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
      return this.findAll({where :{ coursename}})
    }

    static getCourses() {
      return this.findAll();
    }

    static getDescription(coursename,chaptername) {
      return this.findOne({where:{coursename:coursename,chapter:chaptername}})
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