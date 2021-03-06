const authService = require('../services/auth.service');
const {ReS, handleError} = require('../services/util.service');
const pe = require('parse-error');
// const debug = require('debug')('Auth');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {name, email, password} = req.body;
    const errors = [];
    if (!name) {
        errors.push(new Error('Please enter your name'));
    }
    if (!email) {
        errors.push(new Error('Please enter your email'));
    }
    if (!password) {
        errors.push(new Error('Please enter your password'));
    }
    if (!errors.length) {
        try {
            const user = await authService.createUser({name, email, password});
            const userInfo = user.getClean();
            userInfo.token = user.getJWT();
            return ReS(res, userInfo, 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const get = async function (req, res) {
    let user = req.user;
    return ReS(res, {user: user.getClean()});
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        await req.user.update(req.body);
        return ReS(res, {user: req.user.getClean()});
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const user = req.user, id = user.id;
    try {
        await user.destroy();
        return ReS(res, {id}, 204);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;


const login = async function (req, res, next) {
    try {
        const user = await authService.authUser(req.body);
        return ReS(res, {token: user.getJWT(), user: user.getClean()});
    } catch (e) {
        const err = pe(e);
        err.status = 422;
        handleError(e, next);
    }
};
module.exports.login = login;

const me = async function (req, res) {
    return ReS(res, {user: req.user.getClean()});
};
module.exports.me = me;
