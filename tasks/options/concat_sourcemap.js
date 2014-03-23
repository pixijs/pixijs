/* jshint -W106 */
module.exports = {
    dev: {
        files: {
            '<%= files.build %>': require('../src_files')
        },
        options: {
            sourceRoot: '../'
        }
    }
};
