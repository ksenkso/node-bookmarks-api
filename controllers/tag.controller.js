const ReS = require("../services/util.service").ReS;
const handleError = require("../services/util.service").handleError;
const {Tag} = require('../models');

const getAll = async function (req, res, next) {
    try {
        const tags = await req.user.getTags();
        return ReS(res, tags.map(tag => tag.toJSON()));
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.getAll = getAll;

const create = async function (req, res, next) {
    try {
        const tag = await Tag.create(req.body);
        await req.user.addTag(tag);
        return ReS(res, tag.toJSON());
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.create = create;

const remove = async function (req, res, next) {
    const id = req.params.id;
    try {
        const tag = req.tag;
        await tag.destroy();
        return ReS(res, {id});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.remove = remove;

const update = async function (req, res, next) {
    try {
        const tag = req.tag;
        const data = req.body;
        //Prevent owner change
        delete data.UserId;
        await tag.update(data);
        return ReS(res, tag);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.update = update;

const get = async function (req, res, next) {
    try {
        return ReS(res, req.tag);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.get = get;

