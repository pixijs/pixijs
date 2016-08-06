var fs = require('fs');
var through = require('through2');

/**
 * Plugin for browserify to add custom header
 * @param {browserify} browserify Instance of browserify
 * @param {Object} options Options
 */
module.exports = function(browserify, options) {

    var packageInfo = require('../package.json');
    var substitute = {
        date: (new Date()).toString(),
        name: packageInfo.name,
        version: packageInfo.version
    };
    var header = fs.readFileSync(options.file, 'utf8');

    // Subtitute values in the header template
    for(var i in substitute) {
        header = header.replace(
            new RegExp('\\$\\{'+i+'\\}', 'g'),
            substitute[i]
        );
    }
    var createStream = function () {
        var firstChunk = true;
        var stream = through.obj(function (buf, enc, next) {
            if (firstChunk) {
                /*  insert the header comment as the first chunk  */
                this.push(new Buffer(header));
                firstChunk = false;
            }
            this.push(buf);
            next();
        });
        stream.label = 'header';
        return stream;
    };

    //  hook into the bundle generation pipeline of Browserify
    browserify.pipeline.get('wrap').push(createStream());
    browserify.on('reset', function () {
        browserify.pipeline.get('wrap').push(createStream());
    });
};