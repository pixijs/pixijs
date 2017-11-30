import ImageResource from './ImageResource';
import SVGResource from './SVGResource';
import CanvasResource from './CanvasResource';
import VideoResource from './VideoResource';

/**
 * Create a resource element from a single source element. This
 * auto-detects which type of resource to create.
 * @private
 * @function
 * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} source Resource source
 * @return {PIXI.VideoResource|PIXI.SVGResource|PIXI.ImageResource|PIXI.CanvasResource|PIXI.VideoResource} Resource
 */
export default function createResource(source)
{
    if (source.onTextureUpload)
    {
        return source;
    }
    else if (typeof source === 'string')
    {
        // search for file extension: period, 3-4 chars, then ?, # or EOL
        const result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);

        if (result)
        {
            const extension = result[1].toLowerCase();

            if (VideoResource.TYPES.indexOf(extension) > -1)
            {
                return new VideoResource.fromUrl(source);
            }
            else if (SVGResource.TYPES.indexOf(extension) > -1)
            {
                return SVGResource.from(source);
            }
        }

        // probably an image!
        return ImageResource.from(source);
    }
    else if (source instanceof HTMLImageElement)
    {
        return new ImageResource(source);
    }
    else if (source instanceof HTMLCanvasElement)
    {
        return new CanvasResource(source);
    }
    else if (source instanceof HTMLVideoElement)
    {
        return new VideoResource(source);
    }

    // resource that doesn't have onTextureUpload is invalid, shall we throw exception here?

    return source;
}
