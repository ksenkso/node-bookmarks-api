const {OAuth2Client} = require('google-auth-library');
const {User, Folder} = require('../models');
const validator = require('validator');
const debug = require('debug')('Auth');

const CLIENT_ID = '777688038969-dgf86lie7v6pkq4qr3p5rscd1atfu9cg.apps.googleusercontent.com';

/**
 *
 * @param name
 * @param email
 * @param password
 * @param oauth_provider
 * @param oauth_id
 * @return {Promise<Model>}
 * @throws {Error}
 */
const createUser = async ({name, email, password, oauth_provider, oauth_id}) => {
    debug('Creating a new user.');
    // Google Sign In
    if (oauth_id && oauth_provider && !password) {
        debug('It is a Google user!');
        // Should we validate email that comes from the Google API?
        return await User.create({name, email, oauth_provider, oauth_id});
        // Local Sign In
    } else if (!oauth_id && !oauth_provider && name && password) {
        debug('It is a local user!');
        // Validate fields
        if (!validator.isEmail(email)) {
            debug('Email is not valid');
            throw new TypeError('Email is not valid');
        }
        const user = await User.create({name, email, password});
        await Folder.create({name: 'root', UserId: user.id});
        return user;
    }
};
module.exports.createUser = createUser;

/**
 *
 * @param token
 * @return {Promise<TokenPayload | undefined>}
 */
async function checkAccessToken(token) {
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return ticket.getPayload();
}

/**
 *
 * @param email
 * @param password
 * @param token
 * @return {Promise<Model>}
 * @throws {Error}
 */
const authUser = async function ({email, password, token}) {
    if (token && !email && !password) {
        const payload = await checkAccessToken(token);
        if (!!payload) {
            console.log(payload);
            let user = await User.findOne({where: {oauth_provider: "Google", oauth_id: payload.sub}});
            if (user === null) {
                const userData = {
                    name: payload.name,
                    email: payload.email,
                    oauth_provider: "Google",
                    oauth_id: payload.sub
                };
                user = await createUser(userData);
            }
            return user;

        } else {
            throw new Error('Token is invalid');
        }
    } else {
        if (!password) {
            throw new Error('Please enter a password to login.');
        }
        if (!email) {
            throw new Error('Please enter an email to login.');
        }
        if (!validator.isEmail(email)) {
            throw new Error('Please enter a valid email.');
        } else {
            const user = await User.findOne({where: {email}});
            if (user === null) {
                throw new Error('User with this email not found.');
            }
            if (user.oauth_provider !== null && user.oauth_id !== null) {
                throw new Error(`This account is linked to ${user.oauth_provider} account. Maybe You want to login with it?`);
            }
            const passwordValid = await user.comparePassword(password);
            if (!passwordValid) {
                throw new Error('Password is invalid.');
            }
            return user;
        }
    }

};
module.exports.authUser = authUser;

