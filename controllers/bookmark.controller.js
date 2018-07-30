// TODO: Refactor `create` route to use image load function
const {handleError, loadImageForUser} = require("../services/util.service");

const {Bookmark, Folder, Tag} = require('../models');
const {ReS} = require('../services/util.service');

const testLoad = async function (req, res, next) {
    const url = req.body.url;
    const id = req.user.id;
    let image;
    try {
        image = await loadImageForUser(url, id);
        return ReS(res, image);
    } catch (e) {
        if (e.status && e.status === 404) {
            image = {
                image: 'default.jpg',
                background: null,
                type: 'IMG'
            };
            return ReS(res, image);
        } else {
            handleError(e, next);
        }
    }
};
module.exports.testLoad = testLoad;
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
    // Prevent UserId change
    delete bookmarkData.UserId;
    let newBookmark, imageInfo;
    try {
        imageInfo = await loadImageForUser(bookmarkData.url, user.id);
    } catch (e) {
        imageInfo = {
            image: 'default.jpg',
            background: null,
            type: 'IMG'
        };
    }
    try {
        bookmarkData.img = imageInfo.image;
        bookmarkData.imageType = imageInfo.type;
        bookmarkData.background = imageInfo.background;
        newBookmark = await Bookmark.create(bookmarkData);
        const [bookmark] = await Promise.all([
            newBookmark.toJSON(),
            user.addBookmark(newBookmark)
        ]);
        return ReS(res, {bookmark}, 201);
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
        const data = req.body;
        // Prevent owner change
        delete data.UserId;
        const {FolderId} = data;
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
                    await bookmark.update(data);
                    return ReS(res, bookmark.toJSON());
                }
            }
        } else {
            //If FolderId wasn't updated, update the bookmark
            await bookmark.update(data);
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

const addTag = async function (req, res, next) {
    try {
        const {tag, bookmark} = req;
        await bookmark.addTag(tag);
        return ReS(res, bookmark);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.addTag = addTag;

const byTag = async function (req, res, next) {
    const {id} = req.params;
    try {
        const bookmarks = await Bookmark.findAll({
            include: [{
                model: Tag,
                where: {TagId: id}
            }]
        });
        return ReS(res, bookmarks.map(b => b.toJSON()));
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.byTag = byTag;


