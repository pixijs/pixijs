var path = require('path');
var fs = require('fs');

/**
 * Add the license to the top of the bundle file
 * additionally fixed the sourcemapping that got swallowed by uglify
 * @function postbundle
 * @param {String} bundle The output bundle path
 * @param {Boolean} [debug] Fix the mapping if not in debug mode
 */
module.exports = function(bundle, debug) {
    
    var contents = fs.readFileSync(bundle);
    var license = fs.readFileSync(path.join(__dirname, 'license.txt'), 'utf8');
    var packageInfo = require('../package.json');

    // Update the license template
    license = license.replace('${date}', (new Date()).toString())
        .replace('${version}', packageInfo.version);

    // Add the sourcemapurl back to minified
    if (!debug) {
        contents += '//# sourceMappingURL=' + path.basename(bundle) + '.map';
    }

    // Re-write the file
    fs.writeFileSync(bundle, license + contents);
};
