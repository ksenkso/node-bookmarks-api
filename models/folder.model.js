/**
 * @function
 * @name Folder#setUser
 * @param {User} user
 * @return {Promise}
 */
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
    const Folder = sequelize.define('Folder', {
        name: DataTypes.STRING,
    });

    Folder.associate = function (models) {
        this.hasMany(models.Bookmark);
        this.belongsTo(models.Folder, {as: 'Parent'});
        // this.belongsTo(models.User);
        // this.hasOne(models.User, {as: 'Root'});
    };
    /**
     * @name Folder#getChildFolders
     * @return {Promise<Array<Folder>>}
     */
    Folder.prototype.getChildFolders = function () {
        return Folder.findAll({where: {ParentId: this.id}});
    };
    Folder.prototype.isRootFolder = function () {
        return this.UserId && !this.ParentId;
    };

    return Folder;
};
