var express = require('express');
var router = express.Router();


var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
        // if the user is not authenticated then redirect him to the login page
        res.redirect('/login');
}


module.exports = function (passport) {

    /* GET home page. */
  /*  router.get('/', isAuthenticated, function(req, res, next) {
        res.render('index', { title: 'Home' });
    });*/
    router.get('/', isAuthenticated, function(req, res) {
        //res.render('index', { user: req.user });
        res.render('index', { title: 'Home' });
        console.log('req.user:');
        console.log(req.user.name);
    });

    /* GET login page. */
    router.get('/login', function(req, res) {
        res.render('login', { title: 'Login' });
	res.cookie('viaMeraki', 'false', {maxAge: 900000, httpOnly: false});
    });

    /* GET click page. (Meraki) */
    router.get('/click', function(req, res) {
	req.session.host = req.headers.host;
	req.session.base_grant_url = req.query.base_grant_url;
	req.session.user_continue_url = req.query.user_continue_url;
	req.session.node_mac = req.query.node_mac;
	req.session.client_ip = req.query.client_ip;
	req.session.client_mac = req.query.client_mac;
	req.session.splashclick_time = new Date().toString();
	console.log('This is info from the Meraki URL: ');
	console.log(req.session.host);
	console.log(req.session.base_grant_url);
	console.log(req.session.user_continue_url);
	console.log(req.session.node_mac);
	console.log(req.session.client_ip);
	console.log(req.session.client_mac);
	console.log(req.session.splashclick_time);
	res.cookie('viaMeraki', 'true', { maxAge: 900000, httpOnly: false });
	res.render('login', {title: 'Login', session: req.session });
    });

    /* GET auth/spark page. */
    router.get('/auth/spark', passport.authenticate('cisco-spark'), function(req, res) { //is res.render useful here?
        res.render('login', { title: 'Spark Authentication', session: req.session });
    });

    /* GET auth/spark/callback page. */
    router.get('/auth/spark/callback', passport.authenticate('cisco-spark', {
        failureRedirect: '/login',
        successRedirect: '/callback_spark' 
    })
    );

    /* GET /callback_spark page. */
    router.get('/callback_spark', function(req, res) {
        console.log('Requested Spark callback page');
        res.render('callback_spark', { title: 'Welcome', session: req.session });
    });


    /* GET logout page. */
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    /* GET auth/local/callback page. */
    router.get('/auth/local/callback', function(req, res) {
        console.log('Requested local callback page');
        res.render('callback', { title: 'Welcome', session: req.session });
    });

    router.get('/auth/tointernet', function(req, res) {
	console.log('Sent to the internet');
	res.writeHead(302, {'Location': req.session.base_grant_url + "?continue_url="+req.session.user_continue_url});
	res.end();
    });

    return router;
}


//module.exports = router;
