/**
 * Collection of base resource types supported by PixiJS.
 * Resources are used by {@link PIXI.BaseTexture} to handle different media types
 * such as images, video, SVG graphics, etc. In most use-cases, you should not
 * instantiate the resources directly. The easy thing is to use
 * {@link PIXI.BaseTexture.from}.
 * @example
 * const baseTexture = PIXI.BaseTexture.from('path/to/image.jpg');
 * @namespace PIXI.resources
 */
export * from './autoDetectResource';
export { default as Resource } from './Resource';
export { default as ArrayResource } from './ArrayResource';
export { default as BaseImageResource } from './BaseImageResource';
export { default as BufferResource } from './BufferResource';
export { default as CanvasResource } from './CanvasResource';
export { default as CubeResource } from './CubeResource';
export { default as ImageResource } from './ImageResource';
export { default as SVGResource } from './SVGResource';
export { default as VideoResource } from './VideoResource';
