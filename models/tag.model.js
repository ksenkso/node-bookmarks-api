'use strict';
module.exports = (sequelize, DataTypes) => {
    /**
     *
     * @class Tag
     * @extends Sequelize.Model
     */
    const Model = sequelize.define('Tag', {
        name: DataTypes.STRING,
    });

    Model.associate = function (models) {
        this.User = this.belongsTo(models.User);
        this.belongsToMany(models.Bookmark, {through: 'BookmarkTag'});
    };

    return Model;
};
