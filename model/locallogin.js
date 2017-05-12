
var User = require('./db');
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
        roomId: 'Y2lzY29zcGFyazovL3VzL1JPT00vYmRhYWJkZjAtZmU5My0xMWU2LTliNmYtMDllY2RiMzg2MGY1',
        personEmail: '' }
};

var localLogin = function (req, res, next) {



    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
        // if the user is not authenticated then redirect him to the login page
        res.redirect('/login');
}



function(passport) {

    // Use the SparkStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Spark
    //   profile), and invoke a callback with a user object.
    passport.use(new CiscoSparkStrategy({
        clientID: CISCO_SPARK_CLIENT_ID,
        clientSecret: CISCO_SPARK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/spark/callback",
        scope: [
            'spark:rooms_read',
            'spark:memberships_read',
            'spark:messages_write',
            'spark:rooms_write',
            'spark:people_read',
            'spark:memberships_write'
        ]
    },
    function(accessToken, refreshToken, profile, done) {

    //check user table for anyone with a facebook ID of profile.id
        User.findOne({
            'spark.id': profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0],
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    provider: 'spark',
                    //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                    spark: profile._json
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });

                options.form.personEmail = profile.emails[0];

                request(options, function (error, response, body) {
                      if (error) throw new Error(error);
                      console.log(body);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });
    

    }


    ));
}
