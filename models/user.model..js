/**
 * @function
 * @name User#getRootFolder
 * @return {Promise<Folder>}
 */
/**
 * @function
 * @name User#addBookmark
 * @param {Bookmark} bookmark
 */
'use strict';
const debug = require('debug')('Model:User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');
const {Folder} = require('../models');


module.exports = (sequelize, DataTypes) => {
    /**
     * @class User
     * @extends Sequelize.Model
     */
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {isEmail: {msg: "Phone number invalid."}}
        },
        password: DataTypes.STRING,
        oauth_provider: DataTypes.STRING,
        oauth_id: DataTypes.STRING
    });

    User.associate = function (models) {
        User.hasMany(models.Bookmark);
        User.hasMany(models.Tag);
    };

    User.beforeSave(async (user) => {
        if (user.changed('password')) {
            let salt, hash;
            try {
                salt = await bcrypt.genSalt(10);
                hash = await bcrypt.hash(user.password, salt);
                user.password = hash;
            } catch (err) {
                if (!user.password) {
                    throw new Error('Password shouldn\'t be an empty string.');
                }
            }

            user.password = hash;
        }
    });
    /**
     *
     * @param {String} pw
     * @return {Promise<boolean>}
     */
    User.prototype.comparePassword = async function (pw = '') {
        try {
            return await bcrypt.compare(pw, this.password);
        } catch (e) {
            debug(JSON.stringify(e));
            return false;
        }
    };

    User.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return jwt.sign({user_id: this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    };

    User.prototype.getClean = function () {
        let json = this.toJSON();
        delete json['password'];
        return json;
    };

    User.prototype.getRootFolder = function () {
        return Folder.findOne({where: {UserId: this.id, ParentId: null}});
    };
    User.prototype.hasFolderWithId = function (id) {
        return sequelize.query(
            'SELECT EXISTS(SELECT 1 FROM Folders WHERE id = ? AND UserId = ?)',
            {replacements: [id, this.id]}
        );
    };


    return User;
};
