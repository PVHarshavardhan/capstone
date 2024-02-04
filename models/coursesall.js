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
    static getChapters(coursename,author) {
      return this.findAll({where:{coursename,author}})
    }

    static getCourses() {
      return this.findAll({
        attributes: ['coursename','author'],
        group:['coursename','author']
      });
    }

    static getDescription(coursename,chaptername) {
      return this.findOne({where:{coursename:coursename,chapter:chaptername}})
    }

  }
  Coursesall.init({
    coursename: DataTypes.STRING,
    author: DataTypes.STRING,
    chapter: DataTypes.STRING,
    chapterdescription: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Coursesall',
  });
  return Coursesall;
};