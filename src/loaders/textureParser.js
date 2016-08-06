var core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.isImage)
        {
            var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
            baseTexture.imageUrl = resource.url;
            resource.texture = new core.Texture(baseTexture);
            // lets also add the frame to pixi's global cache for fromFrame and fromImage fucntions
            // we use the provided name if available, otherwise the url of the resource
            var id = resource.name || resource.url; 
            core.utils.BaseTextureCache[id] = baseTexture;
            core.utils.TextureCache[id] = resource.texture;
        }

        next();
    };
};
