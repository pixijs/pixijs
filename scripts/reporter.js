/** 
 * Since jshint's CLI doesn't currently support multiple reporters it is necessary 
 * to create a wrapper reporter if jshint-stylish-summary should be used in combination 
 * with another reporter.
 */
module.exports = {
    reporter: function(result, config, options) {
        require('jshint-stylish').reporter(result, config, options);
        require('jshint-stylish-summary').reporter(result, config, options);
    }
};