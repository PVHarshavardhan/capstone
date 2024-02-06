'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Markstat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getReadStatus(userid,coursename,chaptername,author,pagename) {
      return this.findAll({where:{userid,coursename,chaptername,author,pagename}})
    }

    static getMarkedCount(userid,coursename,author) {
      return this.findAll({where:{userid,coursename,author}});
    }
  }
  Markstat.init({
    userid: DataTypes.INTEGER,
    coursename: DataTypes.STRING,
    chaptername: DataTypes.STRING,
    author: DataTypes.STRING,
    pagename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Markstat',
  });
  return Markstat;
};