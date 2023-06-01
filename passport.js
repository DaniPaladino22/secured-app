// Part 1, import dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');

var config = require('./config');
var bunyan = require('bunyan');
const { route } = require('.');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var log = bunyan.createLogger({
    name: 'Microsoft OIDC Example Web Application'
});

passport.serializeUser(function(user, done) {
    done(null, user.oid);
  });
  
  passport.deserializeUser(function(oid, done) {
    findByOid(oid, function (err, user) {
      done(err, user);
    });
  });
  
  // array to hold logged in users
  var users = [];
  
  var findByOid = function(oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
      var user = users[i];
     log.info('we are using user: ', user);
      if (user.oid === oid) {
        return fn(null, user);
      }
    }
    return fn(null, null);
  };


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  };
  
  router.get('/', function(req, res) {       
    res.render('index', { user: req.user });
  });
  
  router.get('/login',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,                      // required
          failureRedirect: '/' 
        }
      )(req, res, next);
    },
    function(req, res) {
        console.log('Login was called in the Sample');
      res.redirect('/');
  });
  
  router.get('/authorization-code/callback',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,    // required
          failureRedirect: '/'  
        }
      )(req, res, next);
    },
    function(req, res) {
        console.log('We received a return from AzureAD.');       
      res.redirect('/');
    });
  
   router.post('/authorization-code/callback', passport.authenticate('azuread-openidconnect', 
   { failureRedirect: '/' }),(req,res)=>{
    console.log('We received a return from AzureAD.');
    console.log('******user Post: '+req.user._json.preferred_username);
    res.redirect('/user');
  });
  
  // 'logout' route, logout from passport, and destroy the session with AAD.
  router.get('/logout', function(req, res){
    req.session.destroy(function(err) {
      req.logOut();
      res.redirect(config.destroySessionUrl);
    });
  });

const getConfiguredPassport = async () => {
    passport.use(new OIDCStrategy({
        identityMetadata: config.creds.identityMetadata,
        clientID: config.creds.clientID,
        responseType: config.creds.responseType,
        responseMode: config.creds.responseMode,
        redirectUrl: config.creds.redirectUrl,
        allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
        clientSecret: config.creds.clientSecret,
        validateIssuer: config.creds.validateIssuer,
        isB2C: config.creds.isB2C,
        issuer: config.creds.issuer,
        passReqToCallback: config.creds.passReqToCallback,
        scope: config.creds.scope,
        loggingLevel: config.creds.loggingLevel,
        nonceLifetime: config.creds.nonceLifetime,
        nonceMaxAmount: config.creds.nonceMaxAmount,
        useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
        cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
        clockSkew: config.creds.clockSkew,
      },
      function(iss, sub, profile, accessToken, refreshToken, done) {
        if (!profile.oid) {
          return done(new Error("No oid found"), null);
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
          findByOid(profile.oid, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              // "Auto-registration"
              users.push(profile);
              return done(null, profile,accessToken, refreshToken);
            }
            return done(null, user,accessToken, refreshToken);
          });
        });
      }      
      
    ));

    return passport;
};

exports = module.exports;
exports.getConfiguredPassport = getConfiguredPassport;
exports.passportController = router;