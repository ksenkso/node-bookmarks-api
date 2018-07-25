const handleError = require("../services/util.service").handleError;

const {Bookmark} = require('../models');
const {ReS} = require('../services/util.service');

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    let user = req.user;
    let bookmarkData = req.body;
    try {
        const bookmark = await Bookmark.create(bookmarkData);
        user.addBookmark(bookmark);
        // let bookmarkJson = await bookmark.toJSON();
        let bookmarkJson = await bookmark.toJSON();
        bookmarkJson.userId = user.id;
        return ReS(res, {bookmark: bookmarkJson}, 201);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.create = create;

const getAll = async function (req, res, next) {
    try {
        let user = req.user;
        const bookmarks = await user.getBookmarks();
        const data = bookmarks.map(b => b.toJSON());
        return ReS(res, {bookmarks: data});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.getAll = getAll;

const get = async function (req, res, next) {
    const id = req.params.id;
    try {
        const bookmark = await Bookmark.findById(id);
        if (!bookmark) {
            const error = new Error('Bookmark with this id not found.');
            handleError(error, next);
        } else {
            return ReS(res, bookmark.toJSON());
        }
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.get = get;

const update = async function (req, res) {
    const id = req.params.id;
    try {
        const bookmark = await Bookmark.findById(id);
        await bookmark.update(req.body);
        return ReS(res, bookmark.toJSON());
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.update = update;

const remove = async function (req, res) {
    const id = req.params.id;
    try {
        const bookmark = await Bookmark.findById(id);
        if (!bookmark) {
            const error = new Error('Bookmark with this id not found.');
            handleError(error, next);
        } else {
            await bookmark.destroy();
            return ReS(res, {id}, 204);
        }
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.remove = remove;
