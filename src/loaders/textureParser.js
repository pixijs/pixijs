var core = require('../core'), Resource = require('resource-loader').Resource;

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        // middleware can be executed before or after image is loaded
        if (resource.loadType === Resource.LOAD_TYPE.IMAGE)
        {
            if (!resource.data) {
                resource.prepareImage();
            }
            var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
            baseTexture.imageUrl = resource.url;
            resource.texture = new core.Texture(baseTexture);
            // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
            core.utils.BaseTextureCache[resource.url] = baseTexture;
            core.utils.TextureCache[resource.url] = resource.texture;
        }

        next();
    };
};
