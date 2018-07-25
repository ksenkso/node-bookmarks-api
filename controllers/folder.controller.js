// TODO: Create a middleware to protect foreign user's data from changing
const ReS = require("../services/util.service").ReS;
const lFolders = debug('Folders');
const lBookmarks = debug('Bookmarks');
const handleError = require("../services/util.service").handleError;
const {Folder} = require('../models');

/**
 *
 * @param {Folder} folder
 * @return {Promise<Array>}
 */
async function extractFoldersContent(folder) {
    const folders = await folder.getChildFolders();
    lFolders(`Folders count: ${folders.length}`);
    const bookmarks = await folder.getBookmarks();
    lBookmarks(`Bookmarks count: ${bookmarks.length}`);
    const items = [];
    folders.forEach(folder => items.push({type: 'folder', data: folder.toJSON()}));
    bookmarks.forEach(bookmark => items.push({type: 'bookmark', data: bookmark.toJSON()}));
    return items;
}

const root = async function (req, res, next) {
    const user = req.user;
    try {
        const rootFolder = await Folder.findOne({where: {ParentId: null, UserId: user.id}});
        const items = await extractFoldersContent(/** @type Folder */rootFolder);
        return ReS(res, {items});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.root = root;

const getFolder = async function (req, res, next) {
    const user = req.user;
    const folderId = req.params.folderId;
    try {
        const folder = await Folder.findById(folderId);
        if (folder) {
            if (folder.UserId === user.id) {
                const items = await extractFoldersContent(/** @type Folder */folder);
                return ReS(res, {items});
            } else {
                const error = new Error('You can access only your own folders and bookmarks.');
                error.status = 403;
                handleError(error, next);
            }
        } else {
            const error = new Error('No such folder');
            error.status = 404;
            handleError(error, next);
        }

    } catch (e) {
        handleError(e, next);
    }
};
module.exports.getFolder = getFolder;

const create = async function (req, res, next) {
    const {name, ParentId} = req.body;
    try {
        const newFolder = await Folder.create({name, ParentId});
        return ReS(res, newFolder.toJSON(), 201);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.create = create;

const update = async function (req, res, next) {
    const id = req.params.id;
    try {
        const folder = await Folder.findById(id);
        await folder.update(req.body);
        return ReS(res, folder);
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.update = update;
const deleteFolder = async function (req, res, next) {
    const id = req.params.id;
    try {
        const folder = await Folder.findById(id);
        await folder.destroy();
        return ReS(res, {id});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.deleteFolder = deleteFolder;
