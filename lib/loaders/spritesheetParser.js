'use strict';

exports.__esModule = true;

exports.default = function () {
    return function spritesheetParser(resource, next) {
        var resourcePath = void 0;
        var imageResourceName = resource.name + '_image';

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data || !resource.isJson || !resource.data.frames || this.resources[imageResourceName]) {
            next();

            return;
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: _resourceLoader.Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl) {
            resourcePath = resource.data.meta.image;
        } else {
            resourcePath = _path2.default.dirname(resource.url.replace(this.baseUrl, '')) + '/' + resource.data.meta.image;
        }

        // load the image for this sheet
        this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res) {
            resource.textures = {};

            var frames = resource.data.frames;
            var frameKeys = Object.keys(frames);
            var baseTexture = res.texture.baseTexture;
            var resolution = core.utils.getResolutionOfUrl(resource.url);
            var scale = resource.data.meta.scale;

            // for now (to keep things compatible) resolution overrides scale
            // Support scale field on spritesheet
            if (resolution === 1 && scale !== undefined && scale !== 1) {
                baseTexture.resolution = resolution = scale;
                baseTexture.update();
            }

            var batchIndex = 0;

            function processFrames(initialFrameIndex, maxFrames) {
                var frameIndex = initialFrameIndex;

                while (frameIndex - initialFrameIndex < maxFrames && frameIndex < frameKeys.length) {
                    var i = frameKeys[frameIndex];
                    var rect = frames[i].frame;

                    if (rect) {
                        var frame = null;
                        var trim = null;
                        var orig = new core.Rectangle(0, 0, frames[i].sourceSize.w / resolution, frames[i].sourceSize.h / resolution);

                        if (frames[i].rotated) {
                            frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.h / resolution, rect.w / resolution);
                        } else {
                            frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.w / resolution, rect.h / resolution);
                        }

                        //  Check to see if the sprite is trimmed
                        if (frames[i].trimmed) {
                            trim = new core.Rectangle(frames[i].spriteSourceSize.x / resolution, frames[i].spriteSourceSize.y / resolution, rect.w / resolution, rect.h / resolution);
                        }

                        resource.textures[i] = new core.Texture(baseTexture, frame, orig, trim, frames[i].rotated ? 2 : 0);

                        // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                        core.utils.TextureCache[i] = resource.textures[i];
                    }

                    frameIndex++;
                }
            }

            function shouldProcessNextBatch() {
                return batchIndex * BATCH_SIZE < frameKeys.length;
            }

            function processNextBatch(done) {
                processFrames(batchIndex * BATCH_SIZE, BATCH_SIZE);
                batchIndex++;
                setTimeout(done, 0);
            }

            function iteration() {
                processNextBatch(function () {
                    if (shouldProcessNextBatch()) {
                        iteration();
                    } else {
                        next();
                    }
                });
            }

            if (frameKeys.length <= BATCH_SIZE) {
                processFrames(0, BATCH_SIZE);
                next();
            } else {
                iteration();
            }
        });
    };
};

var _resourceLoader = require('resource-loader');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BATCH_SIZE = 1000;
//# sourceMappingURL=spritesheetParser.js.map