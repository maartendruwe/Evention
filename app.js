var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/*
var index = require('./routes/index');
var users = require('./routes/users');
*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
app.use('/', index);
app.use('/users', users);
*/

/* Passport setup */
var passport = require('passport');

var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));

app.use(passport.initialize());
app.use(passport.session());

var initPassport = require('./model/passport');
initPassport(passport);

/*
var routes = require('./routes/index')(passport);
app.use('/', routes);
*/

var index = require('./routes/index')(passport);
var users = require('./routes/users');

app.use('/', index);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//var port = 80;
//app.listen(port);
//console.log('Web app started and listening on port ' + port);
//app.set('port', 80);

//http.createServer(app).listen(app.get('port'), function(){
//    console.log('Listening on port ' + app.get('port'));
//});
// END
module.exports = app;
