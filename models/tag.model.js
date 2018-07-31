'use strict';
module.exports = (sequelize, DataTypes) => {
    /**
     *
     * @class Tag
     * @extends Sequelize.Model
     */
    const Tag = sequelize.define('Tag', {
        name: DataTypes.STRING,
    });

    Tag.associate = function (models) {
        this.User = this.belongsTo(models.User);
        this.belongsToMany(models.Bookmark, {through: 'BookmarkTag'});
    };

    return Tag;
};
