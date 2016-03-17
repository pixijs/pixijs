var Resource = require('resource-loader').Resource,
    path = require('path'),
    core = require('../core'),
    async = require('async');

var BATCH_SIZE = 1000;

module.exports = function ()
{
    return function (resource, next)
    {
        var imageResourceName = resource.name + '_image';

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data || !resource.isJson || !resource.data.frames || this.resources[imageResourceName])
        {
            return next();
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        var route = path.dirname(resource.url.replace(this.baseUrl, ''));

        // load the image for this sheet
        this.add(imageResourceName, route + '/' + resource.data.meta.image, loadOptions, function (res)
        {
            resource.textures = {};

            var frames = resource.data.frames;
            var frameKeys = Object.keys(frames);
            var resolution = core.utils.getResolutionOfUrl(resource.url);
            var batchIndex = 0;

            function processFrames(initialFrameIndex, maxFrames)
            {
                var frameIndex = initialFrameIndex;

                while (frameIndex - initialFrameIndex < maxFrames && frameIndex < frameKeys.length)
                {
                    var frame = frames[frameKeys[frameIndex]];
                    var rect = frame.frame;

                    if (rect)
                    {
                        var size = null;
                        var trim = null;

                        if (frame.rotated)
                        {
                            size = new core.Rectangle(rect.x, rect.y, rect.h, rect.w);
                        }
                        else
                        {
                            size = new core.Rectangle(rect.x, rect.y, rect.w, rect.h);
                        }

                        //  Check to see if the sprite is trimmed
                        if (frame.trimmed)
                        {
                            trim = new core.Rectangle(
                                frame.spriteSourceSize.x / resolution,
                                frame.spriteSourceSize.y / resolution,
                                frame.sourceSize.w / resolution,
                                frame.sourceSize.h / resolution
                            );
                        }

                        // flip the width and height!
                        if (frame.rotated)
                        {
                            var temp = size.width;
                            size.width = size.height;
                            size.height = temp;
                        }

                        size.x /= resolution;
                        size.y /= resolution;
                        size.width /= resolution;
                        size.height /= resolution;

                        resource.textures[frameKeys[frameIndex]] = new core.Texture(res.texture.baseTexture, size, size.clone(), trim, frame.rotated);

                        // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                        core.utils.TextureCache[frameKeys[frameIndex]] = resource.textures[frameKeys[frameIndex]];
                    }
                    frameIndex++;
                }
            }

            function shouldProcessNextBatch()
            {
                return batchIndex * BATCH_SIZE < frameKeys.length;
            }

            function processNextBatch(done)
            {
                processFrames(batchIndex * BATCH_SIZE, BATCH_SIZE);
                batchIndex++;
                setTimeout(done, 0);
            }

            if (frameKeys.length <= BATCH_SIZE)
            {
                processFrames(0, BATCH_SIZE);
                next();
            }
            else
            {
                async.whilst(shouldProcessNextBatch, processNextBatch, next);
            }
        });
    };
};
