import { INSTALLED } from './autoDetectResource';
import { ArrayResource } from './ArrayResource';
import { BufferResource } from './BufferResource';
import { CanvasResource } from './CanvasResource';
import { CubeResource } from './CubeResource';
import { ImageResource } from './ImageResource';
import { SVGResource } from './SVGResource';
import { VideoResource } from './VideoResource';
import { ImageBitmapResource } from './ImageBitmapResource';

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
export * from './Resource';
export * from './BaseImageResource';

INSTALLED.push(
    ImageResource,
    ImageBitmapResource,
    CanvasResource,
    VideoResource,
    SVGResource,
    BufferResource,
    CubeResource,
    ArrayResource
);

export * from './autoDetectResource';
export * from './ArrayResource';
export * from './BufferResource';
export * from './CanvasResource';
export * from './CubeResource';
export * from './ImageResource';
export * from './SVGResource';
export * from './VideoResource';
export * from './ImageBitmapResource';
