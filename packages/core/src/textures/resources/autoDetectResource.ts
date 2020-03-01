import { Resource } from './Resource';
import { ImageResource } from './ImageResource';

import type { IImageResourceOptions } from './ImageResource';
import type{ ISize } from '@pixi/math';
import type{ ICubeResourceOptions } from './CubeResource';
import type{ ISVGResourceOptions } from './SVGResource';
import type{ IVideoResourceOptions } from './VideoResource';

/**
 * Allow flexible options for resource plugins
 */
export type IResourcePluginOptions = { [key: string]: any };

/**
 * All allowable options for autoDetectResource
 */
export type IAutoDetectOptions = ISize
    | ICubeResourceOptions
    | IImageResourceOptions
    | ISVGResourceOptions
    | IVideoResourceOptions
    | IResourcePluginOptions;

/**
 * Shape of supported resource plugins
 */
export interface IResourcePlugin
{
    test(source: any, extension: string): boolean;
    new (source: any, options?: any): Resource;
}

/**
 * Collection of installed resource types, class must extend {@link PIXI.resources.Resource}.
 * @example
 * class CustomResource extends PIXI.resources.Resource {
 *   // MUST have source, options constructor signature
 *   // for auto-detected resources to be created.
 *   constructor(source, options) {
 *     super();
 *   }
 *   upload(renderer, baseTexture, glTexture) {
 *     // upload with GL
 *     return true;
 *   }
 *   // used to auto-detect resource
 *   static test(source, extension) {
 *     return extension === 'xyz'|| source instanceof SomeClass;
 *   }
 * }
 * // Install the new resource type
 * PIXI.resources.INSTALLED.push(CustomResource);
 *
 * @name PIXI.resources.INSTALLED
 * @type {Array<*>}
 * @static
 * @readonly
 */
export const INSTALLED: Array<IResourcePlugin> = [];

/**
 * Create a resource element from a single source element. This
 * auto-detects which type of resource to create. All resources that
 * are auto-detectable must have a static `test` method and a constructor
 * with the arguments `(source, options?)`. Currently, the supported
 * resources for auto-detection include:
 *  - {@link PIXI.resources.ImageResource}
 *  - {@link PIXI.resources.CanvasResource}
 *  - {@link PIXI.resources.VideoResource}
 *  - {@link PIXI.resources.SVGResource}
 *  - {@link PIXI.resources.BufferResource}
 * @static
 * @function PIXI.resources.autoDetectResource
 * @param {string|*} source - Resource source, this can be the URL to the resource,
 *        a typed-array (for BufferResource), HTMLVideoElement, SVG data-uri
 *        or any other resource that can be auto-detected. If not resource is
 *        detected, it's assumed to be an ImageResource.
 * @param {object} [options] - Pass-through options to use for Resource
 * @param {number} [options.width] - Width of BufferResource or SVG rasterization
 * @param {number} [options.height] - Height of BufferResource or SVG rasterization
 * @param {boolean} [options.autoLoad=true] - Image, SVG and Video flag to start loading
 * @param {number} [options.scale=1] - SVG source scale. Overridden by width, height
 * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - Image option to create Bitmap object
 * @param {boolean} [options.crossorigin=true] - Image and Video option to set crossOrigin
 * @param {boolean} [options.autoPlay=true] - Video option to start playing video immediately
 * @param {number} [options.updateFPS=0] - Video option to update how many times a second the
 *        texture should be updated from the video. Leave at 0 to update at every render
 * @return {PIXI.resources.Resource} The created resource.
 */
export function autoDetectResource(source: any, options?: IAutoDetectOptions): Resource
{
    if (!source)
    {
        return null;
    }

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
            return new ResourcePlugin(source, options);
        }
    }

    // When in doubt: probably an image
    // might be appropriate to throw an error or return null
    return new ImageResource(source, options as IImageResourceOptions);
}
