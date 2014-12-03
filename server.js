"use strict";

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var path = require("path");
var http = require("http");
var routes = require("routes");

var Limiter = require("express-rate-limiter");
var MemoryStore = require("express-rate-limiter/lib/memoryStore");
var limiter = new Limiter({ db : new MemoryStore() });

var databaseURL = "mongodb://localhost/IT354-Metacritic-Project";

/* Create a new application with Express */
var app = express();

/* Port the server will listen on */
app.set("port", 3080);

/* Connect to mongoDB database */
mongoose.connect(databaseURL, { safe: true }, function(error, response) {
	if(error) { 
		throw error;
	}

	app.use(express["static"](__dirname + "/dist"));

	/* Use Middleware */
	// app.use(limiter.middleware());
	app.use(bodyParser.json());

	/* ROUTES - using Express */
	routes(app);

	/* Create HTTP Server using Express */
	var server = http.createServer(app);

	/* Start HTTP Server bind to port and Listen for connections */
	server.listen(app.get("port"), function() {
		var host = server.address().address;
		console.log("Server running on http://%s:%s/", server.address().address, app.get("port"));
	});

});

