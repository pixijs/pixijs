import { INSTALLED, autoDetectResource } from './autoDetectResource';
import ArrayResource from './ArrayResource';
import BufferResource from './BufferResource';
import CanvasResource from './CanvasResource';
import CubeResource from './CubeResource';
import ImageResource from './ImageResource';
import SVGResource from './SVGResource';
import VideoResource from './VideoResource';

/**
 * Collection of base resource types supported by PixiJS.
 *
 * Resources are used by {@link PIXI.BaseTexture} to handle different media types
 * such as images, video, SVG graphics, etc. In most use-cases, you should not
 * instantiate the resources directly. The easy thing is to use
 * {@link PIXI.BaseTexture.from}.
 * @example
 * const baseTexture = PIXI.BaseTexture.from('path/to/image.jpg');
 * @namespace PIXI.resources
 */
export { default as Resource } from './Resource';
export { default as BaseImageResource } from './BaseImageResource';

INSTALLED.push(
    ImageResource,
    CanvasResource,
    VideoResource,
    SVGResource,
    BufferResource,
    CubeResource,
    ArrayResource
);

export {
    INSTALLED,
    autoDetectResource,
    ArrayResource,
    BufferResource,
    CanvasResource,
    CubeResource,
    ImageResource,
    SVGResource,
    VideoResource };
