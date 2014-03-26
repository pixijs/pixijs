module.exports = {
    options: {
        banner: '<%= banner %>'
    },
    dist: {
        src: require('../src_files'),
        dest: '<%= files.build %>'
    }
};
