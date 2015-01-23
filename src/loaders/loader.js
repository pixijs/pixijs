var Loader = require('asset-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    loader = new Loader();

loader
    // parse any json strings into objects
    .use(Loader.middleware.parsing.json())
    // parse any blob into more usable objects (e.g. Image)
    .use(Loader.middleware.parsing.json())
    // parse any Image objects into textures
    .use(textureParser())
    // parse any spritesheet data into multiple textures
    .use(spritesheetParser());

module.exports = loader;
