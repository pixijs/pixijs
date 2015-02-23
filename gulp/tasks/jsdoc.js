var gulp    = require('gulp'),
	jsdoc   = require('gulp-jsdoc'),
	del 	= require('del');
  

gulp.task('jsdocs',function(){

	// here we use a globbing pattern to match everything inside the 'documentation' folder
	var folders = [
    './documentation/**'
    ];


    var docStrapTemplate = {
    	// docstrap is included in gulp-jsdoc, thanks guys
	    path            	: "ink-docstrap",
	    // the <title> of the web page
	    systemName      	: "The official pixi.js documentaion",
	    // A left-aligned message on the footer
	    footer          	: "Made with ♥ by <a href='http://goodboydigital.com'>Goodboy Digital</a>",
	    // The centred copyright message
	    copyright       	: "© Goodboy Digital Ltd and all the pixi.js contributors",
	    navType         	: "vertical",
	    theme           	: "readable",
	    // TODO add
	    analytics     		: {"ua":"UA-XXXXX-XXX", "domain":"XXXX"},
	    outputSourceFiles 	: true,
	    linenums        	: true,
	    collapseSymbols 	: false,
	    inverseNav      	: false
  	}

    function deleteCallback(error,deletedFiles) {
    	// When the previous docs are deleted, run gulp-jsdoc
    	// 
		return gulp.src('./src/core/display/*.js')
					.pipe( jsdoc('./documentation',docStrapTemplate) )
	}

	
	// deletes the docs folder and re-generates the documentation
	del(folders,deleteCallback);
	
});