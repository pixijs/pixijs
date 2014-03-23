module.exports = {
    options: {
        banner: '<%= banner %>'
    },
    dist: {
        src: '<%= files.build %>',
        dest: '<%= files.buildMin %>'
    }
};
