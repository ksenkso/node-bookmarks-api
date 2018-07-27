const handleError = require("../services/util.service").handleError;

const {Bookmark, Folder} = require('../models');
const {ReS} = require('../services/util.service');

/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    /**
     *
     * @type {User}
     */
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
    try {
        const bookmark = req.bookmark;
        return ReS(res, bookmark.toJSON());
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        const bookmark = req.bookmark;
        const {FolderId} = req.body;
        // Check if FolderId was updated
        if (FolderId && FolderId !== bookmark.FolderId) {
            // If it was, find that folder
            const folder = await Folder.findById(FolderId);
            if (!folder) {
                // If there is no such folder, send error
                const error = new Error('Specified folder does not exist.');
                error.status = 422;
                handleError(error, next);
            } else {
                if (folder.UserId !== req.user.id) {
                    //If it is not user's folder, send error
                    const error = new Error('You can move items only to your own folders.');
                    error.status = 403;
                    handleError(error, next);
                } else {
                    // Update bookmark
                    await bookmark.update(req.body);
                    return ReS(res, bookmark.toJSON());
                }
            }
        } else {
            //If FolderId wasn't updated, update the bookmark
            await bookmark.update(req.body);
            return ReS(res, bookmark.toJSON());
        }
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const id = req.params.id;
    try {
        const bookmark = req.bookmark;
        await bookmark.destroy();
        return ReS(res, {id});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.remove = remove;

