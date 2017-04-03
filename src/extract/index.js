/**
 * This namespace provides renderer-specific plugins for exporting content from a renderer.
 * For instance, these plugins can be used for saving an Image, Canvas element or for exporting the raw image data (pixels).
 *
 * Do not instanciate these plugins directly. They are available from the `plugins` renderer property.
 * @namespace PIXI.extract
 */
export { default as webgl } from './webgl/WebGLExtract';
export { default as canvas } from './canvas/CanvasExtract';
