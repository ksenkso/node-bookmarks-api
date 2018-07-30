const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const pe = require('parse-error');
const cors = require('cors');
const path = require('path');

const v1 = require('./routes/v1');
const app = express();

const CONFIG = require('./config/config');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Passport
app.use(passport.initialize());

//Log Env
console.log("Environment:", CONFIG.app);
//DATABASE
const models = require("./models");
models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', CONFIG.db_name);
})
    .catch(err => {
        console.error('Unable to connect to SQL database:', CONFIG.db_name, err);
    });
if (CONFIG.app === 'dev') {
    models.sequelize.sync();//creates table if they do not already exist
    // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(cors());
app.use('/v1', v1);

app.get(function (req, res) {
    res.statusCode = 200;//send the appropriate status code
    res.json({status: "success", message: "Bookmarks API"})
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
// Don't remove the `next` argument - it's necessary for Express that this function has 4 arguments
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    let errors = (err instanceof Array) ? err : [err];
    errors = errors.map(e => {
        const err = pe(e);
        delete err.line;
        delete err.row;
        delete err.filename;
        delete err.stack;
        return err;
    });

    if (req.app.get('env') === 'production') {

    }
    res
        .status(err.status || 500)
        .json({success: false, errors});
});

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});
