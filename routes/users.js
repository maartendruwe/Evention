var express = require('express');
var router = express.Router();

var User = require('../model/db');

var request = require('request');

var options = {
    method: 'POST',
    url: 'https://api.ciscospark.com/v1/memberships',
    headers: {
        authorization: 'Bearer OTc4YTljMGEtZjMyMy00N2M0LWE5N2UtYzQ2MWQwMDVkNjE3N2MyNzhiM2YtMzVl',
        'content-type': 'application/x-www-form-urlencoded' },
    form: {
        roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vMjk4MDZkZTAtYzZiZC0xMWU2LWFhZTctMzU1MDJhNDFiNDg1',
        personEmail: '' }
};

//module.exports = function(passport) {

/* GET users listing. */
router.get('/userlist', function(req, res) {
    User.find({}, function (err, docs) {
        res.json(docs);
    });
});

/* POST to adduser. */
router.post('/adduser', function(req, res) {

    console.log(req.body.email);

    User.findOne({
        'email': req.body.email
    }, function(err, user) {
        if (err) {
            console.log(err);
            //return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
            var user = new User(req.body);
            user.save(function(err) {
                if (err) console.log(err);
                //return done(err, user);
            });

            options.form.personEmail = req.body.email;

            request(options, function (error, response, body) {
                  if (error) throw new Error(error);
                  console.log(body);
            });
        } else {
            //found user. Return
            //return done(err, user);
        }
    });

    //res.send((err === null) ? { msg: '',  redirectUrl: '/auth/local/callback'} : { msg: err });
    //res.send((err === null) ? { msg: ''} : { msg: err });
    //res.render('callback', { title: 'Callback' });
    //res.send({err: 0, redirectUrl: "/auth/local/callback"});
    //res.redirect('/auth/local/callback');
    //res.redirect(307, '/auth/local/callback');

    res.send({redirect: '/auth/local/callback'});

    //res.writeHead(302, {'Location': req.session.base_grant_url + "?continue_url="+req.session.user_continue_url});
    //res.end();

});

/* DELETE to deleteuser. */
router.delete('/deleteuser/:id', function(req, res) {
    User.findOneAndRemove({ '_id' : req.params.id }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

//return router;
//
//}

module.exports = router;
