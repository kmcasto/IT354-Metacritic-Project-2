var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

// Number of computation cycles with Encryption
var SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;

var userSchema = new Schema({
	username: { 
		type: String, 
		required: true, 
		unique: true 
	},
	password: { 
		type: String, 
		required: true
	},
	games:[{
		name : String, 
		url : String ,
		rlsdate: String,
		platform: String
	}]
});

userSchema.set("autoIndex", false);

module.exports = userSchema;

userSchema.pre("save", function(next) {
	var user = this;

	if(!user.isModified("password")) {
		return next();
	}
 
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) {
			return next(err);
		}

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

/* Password verification */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) {
			return cb(err);
		}

		cb(null, isMatch);
	});
};

var UserModel = mongoose.model("UserModel", userSchema );

module.exports = UserModel;

