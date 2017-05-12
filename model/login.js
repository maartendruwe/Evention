var CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
var User = require('./db');
var request = require('request');

var CISCO_SPARK_CLIENT_ID = "Ca4771d8a91e4ae2eff4b0cb50a4a1035ee3cc1fcaf17d9de07d3c935602332b5";
var CISCO_SPARK_CLIENT_SECRET = "6dce449db5cea22fe91d38ad72f2972d7f3d4a9eecc3a457267da8b679b234d1";

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


module.exports = function(passport) {

    // Use the SparkStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Spark
    //   profile), and invoke a callback with a user object.
    passport.use(new CiscoSparkStrategy({
        clientID: CISCO_SPARK_CLIENT_ID,
        clientSecret: CISCO_SPARK_CLIENT_SECRET,
        callbackURL: "http://52.29.30.212:8080/auth/spark/callback",
        scope: [
            'spark:people_read'
        ]
    },
    function(accessToken, refreshToken, profile, done) {
/*
scope: [
    'spark:rooms_read',
    'spark:memberships_read',
    'spark:messages_write',
    'spark:rooms_write',
    'spark:people_read',
    'spark:memberships_write'
]
*/

/*
    console.log(profile._json);
    console.log(typeof profile._json);
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Cisco Spark profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Cisco Spark account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });

*/

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
                    //now in the future searching on User.findOne({'spark.id': profile.id } will match because of this next line
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
