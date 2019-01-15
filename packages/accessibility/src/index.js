/**
 * This namespace contains an accessibility plugin for allowing interaction via the keyboard.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.Renderer#plugins}.
 * @namespace PIXI.accessibility
 */
export { default as accessibleTarget } from './accessibleTarget';
export { default as AccessibilityManager } from './AccessibilityManager';
