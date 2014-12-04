"use strict";

var UserControllers = angular.module("metaApp.userControllers", []);
var Services = angular.module("metaApp.userServices", []);
var Controllers = angular.module("metaApp.Controllers", []);

var app = angular.module("metaApp", [ 
	"ngRoute", 
	"metaApp.Controllers", 
	"colorpicker.module", 
	"metaApp.userControllers", 
	"metaApp.userServices", 
	"angular-flash.flash-alert-directive", 
	"angular-flash.service" 
]);


app.config(function($routeProvider, $locationProvider, $httpProvider) {
	$httpProvider.interceptors.push("authInterceptor");
  
	$routeProvider.when("/register", {
		templateUrl: "views/register.tpl.html",
		controller  : "RegisterCtrl",
		access: { requiredLogin: false }
	});

	$routeProvider.when("/games", {
		templateUrl: "views/games.tpl.html",
		controller  : "GameCtrl",
		access: { requiredLogin: true }
	});

	$routeProvider.when("/login", {
		templateUrl: "views/login.tpl.html",
		controller: "LoginCtrl",
		access: { requiredLogin: false }
	});

	$routeProvider.when("/logout", {
		templateUrl: "views/login.tpl.html",
		controller: "LogoutCtrl",
		access: { requiredLogin: true }
	});

	$routeProvider.otherwise({
		redirectTo: "/login",
		access: { requiredLogin: false }
	});

});

app.run(function($rootScope, $location, $window, AuthenticationService) {
	$rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {

		// redirect only if both isAuthenticated is false and no token is set
		if(nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin && !AuthenticationService.isLogged && !$window.sessionStorage.token) {
			$location.path("/login"); 
		}
	});
});

UserControllers.controller("RegisterCtrl", function ($scope, $http, $location, $window, AuthenticationService, $rootScope, flash) {
	// for angular-flash messages
	$scope.all = function() {
			$scope.info();
			$scope.warn();
			$scope.success();
			$scope.error();
	};

	$scope.register = function register(username, password, passwordConfirm) {
		if(AuthenticationService.isLogged) {
			// Flash Messages
			$scope.info = function() {
				flash.info = "Already logged in";
			};
			$scope.warn = function() {
				flash.warn = "";
			};
			$scope.success = function() {
				flash.success = "";
			};
			$scope.error = function() {
				flash.error = "";
			};
			$scope.all();
		} else {
			var http_post = $http.post("/register", $scope.user);

			http_post.success(function(data, status, headers, config) {
				// Flash Messages
				$scope.info = function() {
					flash.info = "";
				};
				$scope.warn = function() {
					flash.warn = "";
				};
				$scope.success = function() {
					flash.success = "You are now Registered and can logon!";
				};
				$scope.error = function() {
					flash.error = "";
				};
				$scope.all();

				$location.path("/login");
			});

			http_post.error(function(data, status, headers, config) {
				// Flash Messages
				$scope.info = function() {
					flash.info = "";
				};
				$scope.warn = function() {
					flash.warn = "";
				};
				$scope.success = function() {
					flash.success = "";
				};

				if(status == 409) {
					$scope.error = function() {
						flash.error = "Username already in use";
					};
					$scope.all();
				} else if(status == 400) {
					$scope.error = function() {
						flash.error = "Passwords do not match";
					};
					$scope.all();
				}
			});
		}
	};

	// If JWT exists in session storage i.e. user logged in
	// get username from JWT
	if($window.sessionStorage.token) {
		var encodedProfile = $window.sessionStorage.token.split(".")[1];
		var profile = JSON.parse(url_base64_decode(encodedProfile));
		$rootScope.welcome = "Welcome " + JSON.stringify(profile.username);	
	}

});

UserControllers.controller("LoginCtrl", function($scope, $http, $location, $window, AuthenticationService, $rootScope, flash) {
	// For Flash messages
	$scope.all = function() {
		$scope.info();
		$scope.warn();
		$scope.success();
		$scope.error();
	};

	$scope.login = function() {
		var http_post = $http.post("/login", $scope.user);

		http_post.success(function(data, status, headers, config) {
				// save JWT to sessionStorage.
				$window.sessionStorage.token = data.token;

				// Logged In **
				AuthenticationService.isLogged = true;

				$location.url("/games");
		});
			
		http_post.error(function (data, status, headers, config) {
		 	// Erase JWT token if the user fails to log in
			delete $window.sessionStorage.token;

			// NOT Logged In **			
			AuthenticationService.isLogged = false;
 
			// Handle login errors here
			$scope.info = function() {
				flash.info = "";
			};
			$scope.warn = function() {
				flash.warn = "";
			};
			$scope.success = function() {
				flash.success = "";
			};
			$scope.error = function() {
				flash.error = "Error logging in";
			};
			$scope.all();
		});
	}	
});

UserControllers.controller("LogoutCtrl", function($scope, $http, $window, $location, AuthenticationService, $rootScope, flash) {
	// for Flash messages
	$scope.all = function() {
		$scope.info();
		$scope.warn();
		$scope.success();
		$scope.error();
	};

	var http_post = $http.post("/logout");

	http_post.success(function(data, status, headers, config) {
		// Logged In **
		AuthenticationService.isLogged = false;

		//Erase JWT token if the user fails to log in
		delete $window.sessionStorage.token; 

		// Flash Messages
		$scope.info = function () {
			flash.info = "";
		};
		$scope.warn = function () {
			flash.warn = "";
		};
		$scope.success = function () {
			flash.success = "You have been logged out";
		};
		$scope.error = function () {
			flash.error = "";
		};
		$scope.all();

		$location.url("/");
	});

	http_post.error(function(data, status, headers, config) {
		// Flash Messages
		$scope.info = function () {
			flash.info = "";
		};
		$scope.warn = function () {
			flash.warn = "";
		};
		$scope.success = function () {
			flash.success = "";
		};
		$scope.error = function () {
			flash.error = "Problem logging out";
		};
		$scope.all();

	});
});

Services.factory("AuthenticationService", function($rootScope, $window) {
	if(!$window.sessionStorage.token) {
		var auth = { isLogged: false }
	}
	if($window.sessionStorage.token) {
		var auth = { isLogged: true }
	}

	$rootScope.auth = auth;

	return auth;
});

/*
 * Now we have the JWT saved on sessionStorage. 
 * If the token is set, we are going to set the Authorization HEADER for every outgoing request done using $http. 
 * As value part of that header we are going to use Bearer <token>.
 * 
 * sessionStorage: Although is not supported in all browsers (you can use a polyfill) 
 * is a good idea to use it instead of cookies ($cookies, $cookieStore) and localStorage: 
 * The data persisted there lives until the browser tab is closed.
 */
Services.factory("authInterceptor", function($rootScope, $q, $window, AuthenticationService) {
	return {
		request: function(config) {
			config.headers = config.headers || {};
			if($window.sessionStorage.token) {
				config.headers.Authorization = "Bearer " + $window.sessionStorage.token;
			}
			return config;
		},

		response: function(response) {
			if(response.status === 401) {
				alert("Not Logged On");

				// handle the case where the user is not authenticated
			}
			return response || $q.when(response);
		}
	};
});

Controllers.controller("GameCtrl", function($scope, $http, $location, $window, $rootScope) {
	$scope.games = {};
	console.log('woop');
	
	/*
	// Simple POST request example (passing data) :
	$http.post('/games/', {name:'hello world!'}).
	success(function(data, status, headers, config) {
		console.log('we good');
		// this callback will be called asynchronously
		// when the response is available
		}).
		error(function(data, status, headers, config) {
		console.log('we bad');
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
	*/
	
	/* GET /games */
	var http_req = $http.get("/games");

	http_req.success(function(data, status, headers, config) {
		$scope.games = data;

		var encodedProfile = $window.sessionStorage.token.split(".")[1];
		var profile = JSON.parse(url_base64_decode(encodedProfile));
		$scope.error = ""
		$rootScope.welcome = "Welcome " + JSON.stringify(profile.username).replace(/\"/g, "") + "!";
	});

	http_req.error(function(data, status, headers, config) {
		console.log("Error getting users video games: " + data);
			
		$location.url("/login");

		// Erase JWT token
		delete $window.sessionStorage.token;

		// Logged Out
		AuthenticationService.isLogged = false;
	});

	/* Add a video game */
	$scope.addGame = function(game) {
		console.log('add game');
		var http_req = $http.post("/games", $scope.game)

		http_req.success(function(data, status, headers, config) {
			$scope.games = data;
			console.log('add game success');
		});

		http_req.error(function(data, status, headers, config) {
			console.log(data);
			console.info("Error POSTing users games: " + data);
		});
	};
		
	/* DELETE a game from the users list. */
	$scope.deleteGame = function(game) {
		console.log('delete game');
		var http_req = $http.delete("/games/" + game._id);

		http_req.success(function(data, status, headers, config) {
			console.log('delete game success');
			$scope.game = data;
		});

		http_req.error(function(data, status, headers, config) {
			console.log("Error deleting: " + data);
		});
	};

	/* Clear Form */
	$scope.clearGameForm = function(input) {
		input.name = "";
	};
	
	$scope.systems = [
	{ name: 'ps4',    selected: false },
	{ name: 'xboxone',   selected: false },
	{ name: 'ps3',     selected: false },
	{ name: 'xbox360', selected: false },
	{ name: 'pc', selected: false },
	{ name: 'wii-u', selected: false },
	{ name: '3ds', selected: false },
	{ name: 'vita', selected: false },
	{ name: 'ios', selected: false },
	];

	// selected systems
	$scope.selection = [];
	var selections;

	// helper method to get selected systems
	$scope.selectedSystems = function selectedSystems() {
	return filterFilter($scope.systems, { selected: true });
	};

	/*
	$scope.buildGames = function(sysReq) {
	// https://byroredux-metacritic.p.mashape.com/game-list/{platform}/{list_type}
	$http.get('https://byroredux-metacritic.p.mashape.com/game-list/' + sysReq + '/new-releases').
		success(function(data, status, headers, config) {
			console.log('got games back');
		// this callback will be called asynchronously
		// when the response is available
		}).
		error(function(data, status, headers, config) {
			console.log('didnt get games back');
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
	}
	*/
	
	var config = {headers:  {
        'X-Mashape-Key' : 'UgBycoUL77msh0GyPlopOGGV4f6tp1JnUNPjsn5MzOuTjjKVp5',
        'Accept': 'application/json;odata=verbose',
        "X-Testing" : "testing"
    }};
	
	function buildGames(system) {
		var baseURL = "https://byroredux-metacritic.p.mashape.com/game-list/";
		//"https://byroredux-metacritic.p.mashape.com/game-list/ps4/coming-soon"

		$http.get(baseURL + system + "/new-releases", config).
		success(function(data, status, headers, config) {
			$scope.gameResults = data.results;
		}).
		error(function(data, status, headers, config) {
		  // log error
		});
	}
	
	// watch systems for changes
	$scope.$watch('systems|filter:{selected:true}', function (nv) {
	selections = nv.map(function (system) {
	console.log(system.name);
	buildGames(system.name);
	return system.name;
	});
	}, true);
	

});

/*
 * Original: https://github.com/davidchambers/Base64.js
 */
function url_base64_decode(str) {
	var output = str.replace("-", "+").replace("_", "/");
	switch(output.length % 4) {
	case 0:
		break;
	case 2:
		output += "==";
		break;
	case 3:
		output += "=";
		break;
	default:
		throw "Illegal base64url string!";
	}

	return window.atob(output); 
};

