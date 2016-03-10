var Resource = require('resource-loader').Resource,
    path = require('path'),
    core = require('../core');

const BATCH_SIZE = 100;

module.exports = function() {
    return function(resource, next) {
        // skip if no data, its not json, or it isn't spritesheet data
        if (!resource.data || !resource.isJson || !resource.data.frames) {
            return next();
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        var route = path.dirname(resource.url.replace(this.baseUrl, ''));

        var resolution = core.utils.getResolutionOfUrl(resource.url);

        // load the image for this sheet
        this.add(resource.name + '_image', route + '/' + resource.data.meta.image, loadOptions, function(res) {
            resource.textures = {};

            var frames = resource.data.frames;
            var frameKeys = Object.keys(frames);

            function processBatch(frameIndexOffset, done) {
                var frameIndex = frameIndexOffset;
                while (frameIndex - frameIndexOffset  < BATCH_SIZE && frameIndex < frameKeys.length) {
                    var frame = frames[frameKeys[frameIndex]];
                    var rect = frame.frame;

                    if (rect) {
                        var size = null;
                        var trim = null;

                        if (frame.rotated) {
                            size = new core.Rectangle(rect.x, rect.y, rect.h, rect.w);
                        }
                        else {
                            size = new core.Rectangle(rect.x, rect.y, rect.w, rect.h);
                        }

                        //  Check to see if the sprite is trimmed
                        if (frame.trimmed) {
                            trim = new core.Rectangle(
                                frame.spriteSourceSize.x / resolution,
                                frame.spriteSourceSize.y / resolution,
                                frame.sourceSize.w / resolution,
                                frame.sourceSize.h / resolution
                            );
                        }

                        // flip the width and height!
                        if (frame.rotated) {
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
                done();
            }

            console.log('start process');
            for(var batchIndex = 0; batchIndex * BATCH_SIZE < frameKeys.length; batchIndex++) {
                console.log('process batch', batchIndex);
                processBatch(batchIndex * BATCH_SIZE, function() {});
            }
            next();
        });
    };
};
