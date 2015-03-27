var core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.data.nodeName && resource.data.nodeName.toLowerCase() === 'img')
        {
            resource.texture = new core.Texture(new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url)));
            // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
            // retrieve resource.name to let possibility using key or raw url
            core.utils.TextureCache[resource.name] = resource.texture;
        }

        next();
    };
};
