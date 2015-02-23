var gulp    = require('gulp'),
	jsdoc   = require('gulp-jsdoc'),
	del 	= require('del');
  

gulp.task('jsdocs',function(){

	// here we use a globbing pattern to match everything inside the 'documentation' folder
	var folders = [
    './documentation/**'
    ];

    var docStrapTemplate = {
	    path            : "ink-docstrap",
	    // the <title> attribute for the web page
	    systemName      : "The official pixi.js documentaion",
	    // A left-aligned message on the footer
	    footer          : "Made with ♥ by <a href='http://goodboydigital.com'>Goodboy Digital</a>",
	    // The centred copyright message
	    copyright       : "© Goodboy Digital Ltd and all its contributors",
	    navType         : "vertical",
	    theme           : "readable",
	    linenums        : true,
	    collapseSymbols : false,
	    inverseNav      : false
  	}

    function deleteCallback(error,deletedFiles) {

    	// When the previous docs are deleted, run gulp-jsdoc
    	// 
		return gulp.src('./src/core/display/*.js')
					.pipe( jsdoc('./documentation',docStrapTemplate) )
	}

	del(folders,deleteCallback);
	
});