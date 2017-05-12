var express = require('express');
var router = express.Router();

var User = require('../model/db');

var request = require('request');

var CISCO_SPARK_CLIENT_ID = "Ca4771d8a91e4ae2eff4b0cb50a4a1035ee3cc1fcaf17d9de07d3c935602332b5";
var CISCO_SPARK_CLIENT_SECRET = "6dce449db5cea22fe91d38ad72f2972d7f3d4a9eecc3a457267da8b679b234d1";

var options = {
    method: 'POST',
    url: 'https://api.ciscospark.com/v1/memberships',
    headers: {
        authorization: 'Bearer NjY2MGQzNzEtZWM2Yy00NzU4LTkxODgtOGZjYWQzMzNiOWI4NjE0NDY3OWUtNWQy',
        'content-type': 'application/x-www-form-urlencoded' },
    form: {
        roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vOGM4NGIwNTAtMzNkYi0xMWU3LTljNjMtMmJkZDA0NjhiMzg5',
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
