/**
 * This namespace contains a renderer plugin for handling mouse, pointer, and touch events.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.WebGLRenderer#plugins}.
 * @namespace PIXI.interaction
 */
export { default as InteractionData } from './InteractionData';
export { default as InteractionManager } from './InteractionManager';
export { default as interactiveTarget } from './interactiveTarget';
