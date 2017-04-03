/**
 * The prepare namespace provides renderer-specific plugins for pre-rendering DisplayObjects. These plugins are useful for
 * asynchronously preparing assets, textures, graphics waiting to be displayed.
 *
 * Do not instanciate these plugins directly. They are available from the `plugins` renderer property.
 * @namespace PIXI.prepare
 */
export { default as webgl } from './webgl/WebGLPrepare';
export { default as canvas } from './canvas/CanvasPrepare';
export { default as BasePrepare } from './BasePrepare';
export { default as CountLimiter } from './limiters/CountLimiter';
export { default as TimeLimiter } from './limiters/TimeLimiter';
