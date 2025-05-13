// Auto-generated code, do not edit manually
export * from './AccessibilitySystem';
export * from './accessibilityTarget';


/**
 * @module
 * @categoryDescription accessibility
 *
 * The accessibility module provides screen reader and keyboard navigation support for PixiJS content.
 * This is very important as it can possibly help people with disabilities access PixiJS content.
 *
 * This module is a mixin for {@link AbstractRenderer} and needs to be imported if managing your own renderer:
 * ```js
 * import 'pixi.js/accessibility';
 * ```
 *
 * Make objects accessible by setting their properties:
 * ```js
 * container.accessible = true;        // Enable accessibility for this container
 * container.accessibleType = 'button' // Type of DOM element to create (default: 'button')
 * container.accessibleTitle = 'Play'  // Optional: Add screen reader labels
 * ```
 *
 * By default, the accessibility system activates when users press the tab key. For cases where
 * you need control over when accessibility features are active, configuration options are available:
 * ```js
 * const app = new Application({
 *     accessibilityOptions: {
 *         enabledByDefault: true,    // Create accessibility elements immediately
 *         activateOnTab: false,      // Prevent tab key activation
 *         debug: false,               // Show accessibility divs
 *         deactivateOnMouseMove: false, // Prevent accessibility from being deactivated when mouse moves
 *     }
 * });
 * ```
 *
 * The system can also be controlled programmatically:
 * ```js
 * app.renderer.accessibility.setAccessibilityEnabled(true);
 * ```
 *
 * See {@link accessibility.AccessibleOptions} for all configuration options.
 */
