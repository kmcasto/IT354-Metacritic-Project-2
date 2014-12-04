/* JSON Web Token Secret String */
var secret = "If you share this, you have signed your own death warrant";

var mongoose = require("mongoose");
var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");
var jwtTools = require("jwt-tools");

var UserModel = require("user-model");

/**
 * Register a new user.
 */
function register(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var passwordConfirmation = request.body.passwordConfirmation;

	if(username === undefined) {
		response.status(400).send("Invalid Username");
	} else if(password === undefined) {
		response.status(400).send("Invalid Password");
	} else if(password !== passwordConfirmation) {
		response.status(400).send("Password missmatch");
	}

	// Check if username exists already
	UserModel.findOne({ username: request.body.username }, function(error, user) {
		if(error) {
			console.log(error);
			response.status(401).send("Unauthorised: Error finding username");
		} else if(user) {
			// User exists already
			response.status(409).send("Conflict: Username already exists");
		} else if(user == undefined) {
			// User does not exist already
			var newUser = new UserModel({
				username : request.body.username,
				password : request.body.password
			});

			newUser.save(function(error) {
				if(error) {
					console.log(error);
					response.status(500).send("Internal Server Error: Error saving new user.");
				} else {
					return response.status(200).send("New user registered");
				}
			});	
		}

	})

}

/**
 * Process a login request.
 */
function login(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	if(username === undefined) { 
		return response.status(401).send("Username field is empty"); 
	} else if(password === undefined) { 
		return response.status(401).send("Password field is empty"); 
	}

	UserModel.findOne({ username: request.body.username }, function(error, user) {
		if(error) {
			console.log(error);
			return response.status(401).send("Error finding user in MongoDB");
		}

		if(user === undefined) {
			return response.status(401).send("User does not exist");
		}
			
		user.comparePassword(request.body.password, function(error, isMatch) {
			if(!isMatch) {					
				console.log("Attempt failed to login with " + user.username);
				return response.status(401).send("Password is incorrect");
			}

			var userProfile = {
				user_id : user._id,
				username: user.username
			};

			var token = jwt.sign(userProfile, secret, { expiresInMinutes: 60 * 1 });

			response.json({ token: token });
		});
	});
}

/**
 * Log the user out.
 */
function logout(request, response) {
	response.status(200).send("User logged out");
}


/**
 * Add a video game title
 */
function addGame(request, response) {
	/** Unique token key. */
	var token = jwtTools.getJwtFromHeader(request.headers);
 	var decoded = jwt.decode(token);

 	var userId = JSON.stringify(decoded.user_id);
	userId = jwtTools.cleanUserId(userId);

	console.log(request.body);
	var gameName = request.body.name;
	var gameURL = request.body.url;
	var rlsDate = request.body.rlsdate;
	var gamePlatform = request.body.platform;
	console.log(request.body);

	if(gameName === undefined) {
		console.log('empty game.');
		return;
	}

	UserModel.findByIdAndUpdate(userId, { $push : { games: { name: gameName, url: gameURL, rlsdate: rlsDate, platform: gamePlatform } } }, function(error, userdata) {
		if(error) {
			response.send(error);
		} else {
			// Add new Video Game to MongoDB
			userdata.save(function(error) {
				if(error) {
					console.log(error);
				}
				response.send(userdata.games);
			});
		}
	});
}

/**
 * Return a formated list of all the games a user has selected.
 */
function getGames(request, response) {
	/** Unique token key. */
	var token = jwtTools.getJwtFromHeader(request.headers);
 	var decoded = jwt.decode(token);


 	var userId = JSON.stringify(decoded.user_id);
	userId = jwtTools.cleanUserId(userId);

	UserModel.findById(userId , function(error, userdata) {
		if(error) {
			response.send(error);
		} else {
			return response.json(userdata.games);
		}
	});
}

/**
 * Delete a game from the users list.
 */
function deleteGame(request, response) {
	/** Unique token key. */
	var token = jwtTools.getJwtFromHeader(request.headers);
 	var decoded = jwt.decode(token);

 	var userId = JSON.stringify(decoded.user_id);
	userId = jwtTools.cleanUserId(userId);

	UserModel.findByIdAndUpdate(userId ,{ $pull : { games: { _id: request.params.game_id } } }, function(error, userdata) {
 		if(error) {
			console.log(error);
		} else {
			userdata.save(function(error) {
				if(error) {
					console.log(error);
				}
				response.send(userdata.games);
			});
		}
	});
}

module.exports = function(app) {
	/* User Routes */
	app.post("/register", register);
	app.post("/login", login);
	app.post("/logout", logout);

	/* Bookmark Routes */
	app.post("/games", expressJwt({ secret: secret }), addGame);
	app.get("/games", expressJwt({ secret: secret }), getGames);
	app.delete("/games/:game_id", expressJwt({ secret: secret }), deleteGame);
};

