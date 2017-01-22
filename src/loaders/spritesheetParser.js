import { Resource } from 'resource-loader';
import path from 'path';
import * as core from '../core';

const BATCH_SIZE = 1000;

export default function ()
{
    return function spritesheetParser(resource, next)
    {
        let resourcePath;
        const imageResourceName = `${resource.name}_image`;

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data
            || resource.type !== Resource.TYPE.JSON
            || !resource.data.frames
            || this.resources[imageResourceName]
        )
        {
            next();

            return;
        }

        const loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata,
            parentResource: resource,
        };

        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl)
        {
            resourcePath = resource.data.meta.image;
        }
        else
        {
            resourcePath = `${path.dirname(resource.url.replace(this.baseUrl, ''))}/${resource.data.meta.image}`;
        }

        // load the image for this sheet
        this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res)
        {
            resource.textures = {};

            const frames = resource.data.frames;
            const frameKeys = Object.keys(frames);
            const baseTexture = res.texture.baseTexture;
            const scale = resource.data.meta.scale;

            // Use a defaultValue of `null` to check if a url-based resolution is set
            let resolution = core.utils.getResolutionOfUrl(resource.url, null);

            // No resolution found via URL
            if (resolution === null)
            {
                // Use the scale value or default to 1
                resolution = scale !== undefined ? scale : 1;
            }

            // For non-1 resolutions, update baseTexture
            if (resolution !== 1)
            {
                baseTexture.resolution = resolution;
                baseTexture.update();
            }

            let batchIndex = 0;

            function processFrames(initialFrameIndex, maxFrames)
            {
                let frameIndex = initialFrameIndex;

                while (frameIndex - initialFrameIndex < maxFrames && frameIndex < frameKeys.length)
                {
                    const i = frameKeys[frameIndex];
                    const rect = frames[i].frame;

                    if (rect)
                    {
                        let frame = null;
                        let trim = null;
                        const orig = new core.Rectangle(
                            0,
                            0,
                            frames[i].sourceSize.w / resolution,
                            frames[i].sourceSize.h / resolution
                        );

                        if (frames[i].rotated)
                        {
                            frame = new core.Rectangle(
                                rect.x / resolution,
                                rect.y / resolution,
                                rect.h / resolution,
                                rect.w / resolution
                            );
                        }
                        else
                        {
                            frame = new core.Rectangle(
                                rect.x / resolution,
                                rect.y / resolution,
                                rect.w / resolution,
                                rect.h / resolution
                            );
                        }

                        //  Check to see if the sprite is trimmed
                        if (frames[i].trimmed)
                        {
                            trim = new core.Rectangle(
                                frames[i].spriteSourceSize.x / resolution,
                                frames[i].spriteSourceSize.y / resolution,
                                rect.w / resolution,
                                rect.h / resolution
                            );
                        }

                        resource.textures[i] = new core.Texture(
                            baseTexture,
                            frame,
                            orig,
                            trim,
                            frames[i].rotated ? 2 : 0
                        );

                        // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                        core.utils.TextureCache[i] = resource.textures[i];
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

            function iteration()
            {
                processNextBatch(() =>
                {
                    if (shouldProcessNextBatch())
                    {
                        iteration();
                    }
                    else
                    {
                        next();
                    }
                });
            }

            if (frameKeys.length <= BATCH_SIZE)
            {
                processFrames(0, BATCH_SIZE);
                next();
            }
            else
            {
                iteration();
            }
        });
    };
}
