'use strict';
module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('Bookmark', {
        title: DataTypes.STRING,
        url: DataTypes.STRING,
        img: DataTypes.STRING
    });

    Model.associate = function (models) {
        this.User = this.belongsTo(models.User);
    };

    return Model;
};
