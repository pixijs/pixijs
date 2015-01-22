var Loader = require('asset-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    loader = new Loader();

loader
    // parse any json strings into json
    .after(Loader.middleware.parsing.json())
    // parse any image objects into textures
    .after(textureParser())
    // parse any spritesheet data into multiple textures
    .after(spritesheetParser())

module.exports = loader;
