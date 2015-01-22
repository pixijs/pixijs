var Resource = require('asset-loader').Resource,
    core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.data.nodeName && resource.data.nodeName.toLowerCase() === 'img')
        {
            resource.texture = new core.Texture(new core.BaseTexture(resource.data));
        }

        next();
    };
};
