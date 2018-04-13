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
export * from './Resource';
export * from './ArrayResource';
export * from './BaseImageResource';
export * from './BufferResource';
export * from './CanvasResource';
export * from './CubeResource';
export * from './ImageResource';
export * from './SVGResource';
export * from './VideoResource';
