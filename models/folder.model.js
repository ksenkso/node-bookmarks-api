/**
 * @function
 * @name Folder#getBookmarks
 * @return {Promise<Array<Bookmark>>}
 */
/**
 * @function
 * @name Folder#getUser
 * @return {Promise<User>}
 */
/**
 * @function
 * @name Folder#getParent
 * @return {Promise<Folder>}
 */
'use strict';
module.exports = (sequelize, DataTypes) => {
    /**
     * @class Folder
     * @extends Sequelize.Model
     */
    const Model = sequelize.define('Folder', {
        name: DataTypes.STRING,
    });

    Model.associate = function (models) {
        this.User = this.belongsTo(models.User);
        this.hasMany(models.Bookmark);
        this.belongsTo(models.Folder, {as: 'Parent'});
    };
    /**
     * @name Folder#getChildFolders
     * @return {Promise<Array<Folder>>}
     */
    Model.prototype.getChildFolders = function () {
        return Model.findAll({where: {ParentId: this.id}});
    };

    return Model;
};
