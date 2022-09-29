// Part 1, import dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Strategy, discoverAndCreateClient } = require('passport-curity');

// Part 2, configure authentication endpoints
router.get('/login', passport.authenticate('curity'));
router.get('/authorization-code/callback', passport.authenticate('curity', { failureRedirect: '/login' }), (req, res) => {    
    res.redirect('/user');
});

// Part 3, configuration of Passport
const getConfiguredPassport = async () => {

    // Part 3a, discover Curity Server metadata and configure the OIDC client
    const client = await discoverAndCreateClient({
        issuerUrl: 'https://dev-33031955.okta.com/oauth2/default',
        clientID: "0oa6mh16w2zJTfWav5d7",
        clientSecret: "aFNyjG-ENhB6sGj83y-gVlpvK9kERq89bXPckAni",
        redirectUris: ["http://localhost:3000/authorization-code/callback"]
    });

    // Part 3b, configure the passport strategy
    const strategy = new Strategy({
        client,
        params: {
            scope: "openid profile"
        }
    }, function(accessToken, refreshToken, profile, cb) {
        return cb(null, { profile , accessToken,  refreshToken});
    });

    // Part 3c, tell passport to use the strategy
    passport.use(strategy);

    // Part 3d, tell passport how to serialize and deserialize user data
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    return passport;
};

// Part 4, export objects
exports = module.exports;
exports.getConfiguredPassport = getConfiguredPassport;
exports.passportController = router;