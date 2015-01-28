var gutil = require('gulp-util'),
    plumber = require('gulp-plumber');

function errorHandler(err) {
    gutil.log(err.stack || err);
    // var args = [].slice.apply(arguments);

    // // Send error to notification center with gulp-notify
    // notify.onError({
    //   title: 'Error',
    //   message: '<' + '%= error.message %' + '>'
    // }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');
}

module.exports = function () {
    return plumber(errorHandler);
};

module.exports.handler = errorHandler;