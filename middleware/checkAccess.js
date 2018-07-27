const handleError = require("../services/util.service").handleError;
/**
 * @typedef {{
 *  modelClass: Sequelize.Model,
 *  hasPermission: Function<{model: Sequelize.Model, user: User}, Boolean>,
 *  [id]: String = 'id',
 *  [modelName]: String = 'grantedModel'
 *  [errorMessage]: String = 'You cannot access this resource.',
 *  [notFoundMessage]: String = 'Not found.'
 * }} AccessConfig
 */
/**
 *
 * @param {AccessConfig} config
 * @return {Function}
 */
module.exports = function (config) {
    const {
        modelClass,
        id = 'id',
        hasPermission,
        errorMessage = 'You cannot access this resource.',
        notFoundMessage = 'Not found',
        modelName = 'grantedModel'
    } = config;
    return async function (req, res, next) {
        const key = req.params[id];
        const user = req.user;
        try {
            const model = await modelClass.findById(key);
            if (!model) {
                const error = new Error(notFoundMessage);
                error.status = 404;
                return handleError(error, next);
            }
            if (hasPermission({user, model})) {
                req[modelName] = model;
                next();
            } else {
                const error = new Error(errorMessage);
                error.status = 403;
                handleError(error, next);
            }
        } catch (e) {
            handleError(e, next);
        }
    };
};
