const express = require('express');
const app = express();

app.set("view engine", "ejs");
var config = require('./config');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');

const indexController = require('./index');
app.use('/', indexController);



const { getConfiguredPassport, passportController } = require('./passport');

(async () => {
    const passport = await getConfiguredPassport();
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
    app.use(express.urlencoded({ extended : true }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/', passportController);
    app.use(express.static(__dirname + '/../../public'));

    const userController = require('./user');
    app.use('/user', userController);

    app.listen(3000, () => {
        console.log('Server started and listening on port 3000');
    });
})();