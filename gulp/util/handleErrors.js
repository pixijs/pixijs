var gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    ERROR = gutil.colors.red('[ERROR]');

function errorHandler(err) {
    var msg = err.toString();

    if (msg === '[object Object]') {
        msg = err;
    }

    gutil.log(ERROR, err);

    if (err.stack) {
        gutil.log(ERROR, err.stack);
    }

    // Keep gulp from hanging on this task
    this.emit('end');
}

module.exports = function () {
    return plumber(errorHandler);
};

module.exports.handler = errorHandler;
