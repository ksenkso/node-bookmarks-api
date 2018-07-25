/**
 * @function
 * @name Bookmark#getFolders
 * @return {Promise<Array<Folder>>}
 */
/**
 * @function
 * @name Bookmark#getTags
 * @return {Promise<Array<Tag>>}
 */
/**
 * @function
 * @name Bookmark#getUser
 * @return {Promise<User>}
 */
'use strict';
module.exports = (sequelize, DataTypes) => {
    /**
     * @class Bookmark
     * @extends Sequelize.Model
     */
    const Model = sequelize.define('Bookmark', {
        title: DataTypes.STRING,
        url: DataTypes.STRING,
        img: DataTypes.STRING
    });

    Model.associate = function (models) {
        this.User = this.belongsTo(models.User);
        this.belongsTo(models.Folder);
        this.belongsToMany(models.Tag, {through: 'BookmarkTag'});
    };

    return Model;
};
