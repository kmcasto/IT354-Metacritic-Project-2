var gulp = require("gulp");
var jsFilter = require("gulp-uglify");
var nodemon = require("gulp-nodemon");

gulp.task("javascript", function() {
	gulp.src([ 
		"public/js/*.js", 
		"public/js/**/*.js", 
		"bower_components/jquery/dist/jquery.min.js", 
		"bower_components/jquery/dist/jquery.min.map", 
		"bower_components/angular/angular.min.js", 
		"bower_components/angular/angular.min.js.map", 
		"bower_components/angular-route/angular-route.js", 
		"bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js", 
		"bower_components/angular-flash/dist/angular-flash.js", 
		"bower_components/angular-flash/src/directives/flash-alert-directive.js", 
		"bower_components/angular-flash/src/services/flash-service.js", 
		"bower_components/bootstrap/dist/js/bootstrap.min.js" 
	]).pipe(gulp.dest("dist/js"));

});

gulp.task("css", function() {
	/* Copy CSS */
	gulp.src([
		"public/css/*.css", 
		"bower_components/bootstrap/dist/css/bootstrap.min.css", 
		"bower_components/bootstrap/dist/css/bootstrap.css.map", 
		"bower_components/angular-bootstrap-colorpicker/css/colorpicker.css" 
	]).pipe(gulp.dest("dist/css"));

	/* Copy Fonts */
	gulp.src([
		"public/fonts/opensanscondensed-cyrillic-ext.woff2", 
		"public/fonts/opensanscondensed-cyrillic.woff2", 
		"public/fonts/opensanscondensed-greek-ext.woff2", 
		"public/fonts/opensanscondensed-greek.woff2", 
		"public/fonts/opensanscondensed-latin-ext.woff2", 
		"public/fonts/opensanscondensed-latin.woff2", 
		"public/fonts/opensanscondensed-vietnamese.woff2", 
		"public/fonts/rancho.woff2", 
		"bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot", 
		"bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg", 
		"bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf", 
		"bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff"
	]).pipe(gulp.dest("dist/fonts"));
});


gulp.task("html", function() {
	/* Copy all other files, with no filters needed. */
	gulp.src([ 
		"public/*.html", 
		"public/**/*.html", 
	]).pipe(gulp.dest("dist"));
});

gulp.task("run", [ "javascript", "css", "html" ], function() {
	var monitor = nodemon({ 
		script: "server.js", 
		ignore: [ "node_modules/", "bower_components/", "dist/" ], 
		env: { "NODE_PATH": "./server" }
	});

	monitor.on("change", [ "javascript", "css", "html" ]);
})

gulp.task("default", [ "javascript", "css", "html" ]);


