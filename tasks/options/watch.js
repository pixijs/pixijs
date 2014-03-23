//Watches and builds for _development_ (source maps)
module.exports = {
    scripts: {
        files: ['<%= dirs.src %>/**/*.js'],
        tasks: ['concat_sourcemap'],
        options: {
            spawn: false,
        }
    }
};
