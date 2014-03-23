module.exports = {
    compile: {
        name: '<%= package.name %>',
        description: '<%= package.description %>',
        version: '<%= package.version %>',
        url: '<%= package.homepage %>',
        logo: '<%= package.logo %>',
        options: {
            paths: '<%= dirs.src %>',
            outdir: '<%= dirs.docs %>'
        }
    }
};
