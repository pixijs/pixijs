import ImageResource from './ImageResource';
import SVGResource from './SVGResource';
import CanvasResource from './CanvasResource';
import VideoResource from './VideoResource';
import Resource from './Resource';

/**
 * Create a resource element from a single source element. This
 * auto-detects which type of resource to create.
 * @private
 * @function
 * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.resources.Resource} source Resource source
 * @return {PIXI.resources.Resource} resource
 */
export default function createResource(source)
{
    // Already a resource
    if (source instanceof Resource)
    {
        return source;
    }

    // Default use image resource unless
    // one of the situations below invalidates
    // to another resource class
    let ResourceRef = ImageResource;

    if (typeof source === 'string')
    {
        // search for file extension: period, 3-4 chars, then ?, # or EOL
        const result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);

        if (result)
        {
            const extension = result[1].toLowerCase();

            if (VideoResource.TYPES.indexOf(extension) > -1)
            {
                ResourceRef = VideoResource;
            }
            else if (SVGResource.TYPES.indexOf(extension) > -1)
            {
                ResourceRef = SVGResource;
            }
        }
    }
    else if (source instanceof HTMLCanvasElement)
    {
        ResourceRef = CanvasResource;
    }
    else if (source instanceof HTMLVideoElement)
    {
        ResourceRef = VideoResource;
    }

    return new ResourceRef(source);
}
