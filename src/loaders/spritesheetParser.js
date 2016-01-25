var Resource = require('resource-loader').Resource,
    path = require('path'),
    core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data, its not json, or it isn't spritesheet data
        if (!resource.data || !resource.isJson || !resource.data.frames)
        {
            return next();
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        var route = path.dirname(resource.url.replace(this.baseUrl, ''));

        var resolution = core.utils.getResolutionOfUrl( resource.url );

        // load the image for this sheet
        this.add(resource.name + '_image', route + '/' + resource.data.meta.image, loadOptions, function (res)
        {
            resource.textures = {};

            var frames = resource.data.frames;

            for (var i in frames)
            {
                var rect = frames[i].frame;

                if (rect)
                {
                    var frame = null;
                    var trim = null;
                    var crop = new core.Rectangle(0, 0, frames[i].sourceSize.w / resolution, frames[i].sourceSize.h / resolution);

                    if (frames[i].rotated) {
                        frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.h / resolution, rect.w / resolution);
                    }
                    else {
                        frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.w / resolution, rect.h / resolution);
                    }

                    //  Check to see if the sprite is trimmed
                    if (frames[i].trimmed)
                    {
                        trim = new core.Rectangle(
                            frames[i].spriteSourceSize.x / resolution,
                            frames[i].spriteSourceSize.y / resolution,
                            frames[i].spriteSourceSize.w / resolution,
                            frames[i].spriteSourceSize.h / resolution
                         );
                    }

                    resource.textures[i] = new core.Texture(res.texture.baseTexture, frame, crop, trim, frames[i].rotated ? 2 : 0);

                    // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                    core.utils.TextureCache[i] = resource.textures[i];
                }
            }

            next();
        });
    };
};
