var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var db = mongoose.createConnection('localhost/data');

var schema = mongoose.Schema;
var userSchema = new schema({
    name : String,
    email : String,
    accessToken : String,
    refreshToken : String,
    provider : String,
    spark : Object
});

var User = db.model('User', userSchema);

module.exports = User;
