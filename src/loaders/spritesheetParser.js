var Resource = require('asset-loader').Resource,
    core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // if this is a spritesheet object
        if (resource.data && resource.data.frames)
        {
            var loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE
            };

            // load the image for this sheet
            this.loadResource(new Resource(this.baseUrl + resource.data.meta.image, loadOptions), function (res)
            {
                resource.textures = {};

                var frames = resource.data.frames;

                for (var i in frames)
                {
                    var rect = frames[i].frame;

                    if (rect)
                    {
                        var size = new core.math.Rectangle(rect.x, rect.y, rect.w, rect.h);
                        var trim = null;

                        //  Check to see if the sprite is trimmed
                        if (frames[i].trimmed)
                        {
                            trim = new core.math.Rectangle(
                                frames[i].spriteSourceSize.x,
                                frames[i].spriteSourceSize.y,
                                frames[i].sourceSize.w,
                                frames[i].sourceSize.h
                            );
                        }

                        resource.textures[i] = new core.Texture(res.texture.baseTexture, size, size.clone(), trim);
                    }
                }

                next();
            });
        }
        else {
            next();
        }
    };
};
