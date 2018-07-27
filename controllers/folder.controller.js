/**
 * @typedef {{
 *  type: String,
 *  data: Folder|Bookmark
 * }} FolderItem
 */
const ReS = require("../services/util.service").ReS;
const debug = require('debug');
const lFolders = debug('Folders');
const lBookmarks = debug('Bookmarks');
const handleError = require("../services/util.service").handleError;
const {Folder} = require('../models');

/**
 *
 * @param {Folder} folder
 * @return {Promise<Array<FolderItem>>}
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
    try {
        const items = await extractFoldersContent(/** @type Folder */req.folder);
        return ReS(res, {items});
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
    try {
        const folder = req.folder;
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
        const folder = req.folder;
        await folder.destroy();
        return ReS(res, {id});
    } catch (e) {
        handleError(e, next);
    }
};
module.exports.deleteFolder = deleteFolder;
