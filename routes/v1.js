const express 			= require('express');
const router 			= express.Router();

const UserController 	= require('../controllers/user.controller');
const BookmarkController = require('../controllers/bookmark.controller');

const passport      	= require('passport');
const path              = require('path');


require('./../middleware/passport')(passport);
/* GET home page. */
router.get('/', function (req, res) {
    res.json({success: true, message: "Bookmarks API", data: {"version_number": "v1.0.0"}})
});

router.post(    '/users',           UserController.create);                                                    // C
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.get);        // R
router.put(     '/users',           passport.authenticate('jwt', {session:false}), UserController.update);     // U
router.delete(  '/users',           passport.authenticate('jwt', {session:false}), UserController.remove);     // D
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.me);
router.post('/users/login', UserController.google);
router.post('/users/google', UserController.google);

router.post('/bookmarks', passport.authenticate('jwt', {session: false}), BookmarkController.create);                  // C
router.get('/bookmarks', passport.authenticate('jwt', {session: false}), BookmarkController.getAll);                  // R

router.get('/bookmarks/:id', passport.authenticate('jwt', {session: false}), BookmarkController.get);     // R
router.put('/bookmarks/:id', passport.authenticate('jwt', {session: false}), BookmarkController.update);  // U
router.delete('/bookmarks/:id', passport.authenticate('jwt', {session: false}), BookmarkController.remove);  // D



//********* API DOCUMENTATION **********
router.use('/docs/api.json',            express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs',                     express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
