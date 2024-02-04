'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getPages(coursename,chaptername) {
      return this.findAll({where:{coursename,chaptername}})
    }
    static getContent(pagename,coursename,chaptername) {
      return this.findOne({where:{pagename,coursename,chaptername}})
    }

  }
  Pages.init({
    pagename: DataTypes.STRING,
    content: DataTypes.TEXT,
    coursename: DataTypes.STRING,
    chaptername: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pages',
  });
  return Pages;
};