/**
 * This namespace contains a renderer plugin for interaction accessibility for end-users
 * with physical impairments which require screen-renders, keyboard navigation, etc.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.WebGLRenderer#plugins}.
 * @namespace PIXI.accessibility
 */
export { default as accessibleTarget } from './accessibleTarget';
export { default as AccessibilityManager } from './AccessibilityManager';
