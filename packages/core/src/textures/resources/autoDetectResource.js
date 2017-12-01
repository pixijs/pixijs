import ImageResource from './ImageResource';
import CanvasResource from './CanvasResource';
import VideoResource from './VideoResource';
import SVGResource from './SVGResource';
import BufferResource from './BufferResource';
import CubeResource from './CubeResource';
import ArrayResource from './ArrayResource';

/**
 * Collection of installed resource types, class must extend PIXI.resources.Resource.
 * To use a new resource type `PIXI.resources.INSTALLED.push(CustomResource)`
 *
 * @name PIXI.resources.INSTALLED
 * @type {Array<*>}
 * @static
 * @readonly
 */
export const INSTALLED = [
    ImageResource,
    CanvasResource,
    VideoResource,
    SVGResource,
    BufferResource,
    CubeResource,
    ArrayResource,
];

/**
 * Create a resource element from a single source element. This
 * auto-detects which type of resource to create.
 * @static
 * @function PIXI.resources.autoDetectResource
 * @param {string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.resources.Resource} source Resource source
 * @return {PIXI.resources.Resource} resource
 */
export function autoDetectResource(source)
{
    let extension = '';

    if (typeof source === 'string')
    {
        // search for file extension: period, 3-4 chars, then ?, # or EOL
        const result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);

        if (result)
        {
            extension = result[1].toLowerCase();
        }
    }

    for (let i = INSTALLED.length - 1; i >= 0; --i)
    {
        const ResourcePlugin = INSTALLED[i];

        if (ResourcePlugin.test && ResourcePlugin.test(source, extension))
        {
            return new ResourcePlugin(source);
        }
    }

    // When in doubt: probably an image
    // might be appropriate to throw an error or return null
    return new ImageResource(source);
}
