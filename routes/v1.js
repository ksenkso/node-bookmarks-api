const express = require('express');
const router = express.Router();

const {Folder, Bookmark} = require('../models');
const UserController = require('../controllers/user.controller');
const BookmarkController = require('../controllers/bookmark.controller');
const FolderController = require('../controllers/folder.controller');

const passport = require('passport');
const path = require('path');

const checkAccess = require('./../middleware/checkAccess');

const checkFolderPermissions = checkAccess({
    modelClass: Folder,
    hasPermission({user, model}) {
        return model.UserId === user.id;
    },
    errorMessage: 'You can access only your own folders and bookmarks.',
    modelName: 'folder',
    notFoundMessage: 'Folder not found.'
});
const checkBookmarkPermissions = checkAccess({
    modelClass: Bookmark,
    hasPermission({user, model}) {
        return model.UserId === user.id;
    },
    modelName: 'bookmark',
    notFoundMessage: 'Bookmark not found.'
});
require('./../middleware/passport')(passport);
/* GET home page. */
router.get('/', function (req, res) {
    res.json({success: true, message: "Bookmarks API", data: {"version_number": "v1.0.0"}})
});

router.post('/users', UserController.create);                                                    // C
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.get);                   // R
router.put('/users', passport.authenticate('jwt', {session: false}), UserController.update);     // U
router.delete('/users', passport.authenticate('jwt', {session: false}), UserController.remove);     // D
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.me);
router.post('/users/login', UserController.login);

router.post('/bookmarks', passport.authenticate('jwt', {session: false}), BookmarkController.create);                  // C
router.get('/bookmarks', passport.authenticate('jwt', {session: false}), BookmarkController.getAll);                  // R


router.get('/bookmarks/:id', passport.authenticate('jwt', {session: false}), checkBookmarkPermissions, BookmarkController.get);     // R
router.put('/bookmarks/:id', passport.authenticate('jwt', {session: false}), checkBookmarkPermissions, BookmarkController.update);  // U
router.delete('/bookmarks/:id', passport.authenticate('jwt', {session: false}), checkBookmarkPermissions, BookmarkController.remove);  // D


router.get('/folders/root', passport.authenticate('jwt', {session: false}), FolderController.root);                  // R
router.get('/folders/:id', passport.authenticate('jwt', {session: false}), checkFolderPermissions, FolderController.getFolder); // R
router.put('/folders/:id', passport.authenticate('jwt', {session: false}), checkFolderPermissions, FolderController.update); // R
router.delete('/folders/:id', passport.authenticate('jwt', {session: false}), checkFolderPermissions, FolderController.deleteFolder); // R
router.post('/folders', passport.authenticate('jwt', {session: false}), FolderController.create); // R

//********* API DOCUMENTATION **********
router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
