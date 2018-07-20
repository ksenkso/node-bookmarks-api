const {ExtractJwt, Strategy} = require('passport-jwt');
const {User} = require('../models');
const CONFIG = require('../config/config');

module.exports = function (passport) {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;

    passport.use(new Strategy(opts, async function (jwt_payload, done) {
        try {
            const user = await User.findById(jwt_payload.user_id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }));
};
