import { EventSystem } from './EventSystem';
import { FederatedEvent } from './FederatedEvent';

import type EventEmitter from 'eventemitter3';
import type { Container } from '../scene/container/Container';
import type { AllFederatedEventMap } from './FederatedEventMap';
import type { FederatedPointerEvent } from './FederatedPointerEvent';
import type { FederatedWheelEvent } from './FederatedWheelEvent';

/**
 * The type of cursor to use when the mouse pointer is hovering over an interactive element.
 * Accepts any valid CSS cursor value.
 * @example
 * ```ts
 * // Basic cursor types
 * sprite.cursor = 'pointer';    // Hand cursor for clickable elements
 * sprite.cursor = 'grab';       // Grab cursor for draggable elements
 * sprite.cursor = 'crosshair';  // Precise cursor for selection
 *
 * // Direction cursors
 * sprite.cursor = 'n-resize';   // North resize
 * sprite.cursor = 'ew-resize';  // East-west resize
 * sprite.cursor = 'nesw-resize';// Northeast-southwest resize
 *
 * // Custom cursor with fallback
 * sprite.cursor = 'url("custom.png"), auto';
 * ```
 *
 * Common cursor values:
 * - Basic: `auto`, `default`, `none`, `pointer`, `wait`
 * - Text: `text`, `vertical-text`
 * - Links: `alias`, `copy`, `move`
 * - Selection: `cell`, `crosshair`
 * - Drag: `grab`, `grabbing`
 * - Disabled: `not-allowed`, `no-drop`
 * - Resize: `n-resize`, `e-resize`, `s-resize`, `w-resize`
 * - Bidirectional: `ns-resize`, `ew-resize`, `nesw-resize`, `nwse-resize`
 * - Other: `help`, `progress`
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor} MDN Cursor Documentation
 * @category events
 * @standard
 */
export type Cursor = 'auto'
| 'default'
| 'none'
| 'context-menu'
| 'help'
| 'pointer'
| 'progress'
| 'wait'
| 'cell'
| 'crosshair'
| 'text'
| 'vertical-text'
| 'alias'
| 'copy'
| 'move'
| 'no-drop'
| 'not-allowed'
| 'e-resize'
| 'n-resize'
| 'ne-resize'
| 'nw-resize'
| 's-resize'
| 'se-resize'
| 'sw-resize'
| 'w-resize'
| 'ns-resize'
| 'ew-resize'
| 'nesw-resize'
| 'col-resize'
| 'nwse-resize'
| 'row-resize'
| 'all-scroll'
| 'zoom-in'
| 'zoom-out'
| 'grab'
| 'grabbing';

/**
 * Interface defining a hit area for pointer interaction. The hit area specifies
 * the region in which pointer events should be captured by a display object.
 * @example
 * ```ts
 * // Create a rectangular hit area
 * sprite.hitArea = new Rectangle(0, 0, 100, 100);
 *
 * // Create a circular hit area
 * sprite.hitArea = new Circle(50, 50, 50);
 *
 * // Custom hit area implementation
 * sprite.hitArea = {
 *     contains(x: number, y: number) {
 *         // Custom hit testing logic
 *         return x >= 0 && x <= 100 && y >= 0 && y <= 100;
 *     }
 * };
 * ```
 * @remarks
 * - Hit areas override the default bounds-based hit testing
 * - Can improve performance by simplifying hit tests
 * - Useful for irregular shapes or precise interaction areas
 * - Common implementations include Rectangle, Circle, Polygon
 * @see {@link Container.eventMode} For enabling interactivity
 * @see {@link Container.interactive} For backwards compatibility
 * @category events
 * @standard
 */
export interface IHitArea
{
    /**
     * Checks if the given coordinates are inside this hit area.
     * @param {number} x - The x coordinate to check
     * @param {number} y - The y coordinate to check
     * @returns True if the coordinates are inside the hit area
     */
    contains(x: number, y: number): boolean;
}

/**
 * Function type for handlers, e.g., onclick
 * @category events
 * @advanced
 */
export type FederatedEventHandler<T = FederatedPointerEvent> = (event: T) => void;

/**
 * The type of interaction behavior for a Container. This is set via the {@link Container#eventMode} property.
 * @example
 * ```ts
 * // Basic event mode setup
 * const sprite = new Sprite(texture);
 * sprite.eventMode = 'static';    // Enable standard interaction
 * sprite.on('pointerdown', () => { console.log('clicked!'); });
 *
 * // Different event modes
 * sprite.eventMode = 'none';      // Disable all interaction
 * sprite.eventMode = 'passive';   // Only allow interaction on children
 * sprite.eventMode = 'auto';      // Like DOM pointer-events: auto
 * sprite.eventMode = 'dynamic';   // For moving/animated objects
 * ```
 *
 * Available modes:
 * - `'none'`: Ignores all interaction events, even on its children
 * - `'passive'`: **(default)** Does not emit events and ignores hit testing on itself and non-interactive children.
 * Interactive children will still emit events.
 * - `'auto'`: Does not emit events but is hit tested if parent is interactive. Same as `interactive = false` in v7
 * - `'static'`: Emit events and is hit tested. Same as `interactive = true` in v7
 * - `'dynamic'`: Emits events and is hit tested but will also receive mock interaction events fired from
 * a ticker to allow for interaction when the mouse isn't moving
 *
 * Performance tips:
 * - Use `'none'` for pure visual elements
 * - Use `'passive'` for containers with some interactive children
 * - Use `'static'` for standard buttons/controls
 * - Use `'dynamic'` only for moving/animated interactive elements
 * @since 7.2.0
 * @category events
 * @standard
 */
export type EventMode = 'none' | 'passive' | 'auto' | 'static' | 'dynamic';

/**
 * The properties available for any interactive object. This interface defines the core interaction
 * properties and event handlers that can be set on any Container in PixiJS.
 * @example
 * ```ts
 * // Basic interactive setup
 * const sprite = new Sprite(texture);
 * sprite.eventMode = 'static';
 * sprite.cursor = 'pointer';
 *
 * // Using event handlers
 * sprite.on('click', (event) => console.log('Sprite clicked!', event));
 * sprite.on('pointerdown', (event) => console.log('Pointer down!', event));
 *
 * // Using property-based event handlers
 * sprite.onclick = (event) => console.log('Clicked!');
 * sprite.onpointerenter = () => sprite.alpha = 0.7;
 * sprite.onpointerleave = () => sprite.alpha = 1.0;
 *
 * // Custom hit area
 * sprite.hitArea = new Rectangle(0, 0, 100, 100);
 * ```
 *
 * Core Properties:
 * - `eventMode`: Controls how the object handles interaction events
 * - `cursor`: Sets the mouse cursor when hovering
 * - `hitArea`: Defines custom hit testing area
 * - `interactive`: Alias for `eventMode` to enable interaction with "static" or "passive" modes
 * - `interactiveChildren`: Controls hit testing on children
 *
 * Event Handlers:
 * - Mouse: click, mousedown, mouseup, mousemove, mouseenter, mouseleave
 * - Touch: touchstart, touchend, touchmove, tap
 * - Pointer: pointerdown, pointerup, pointermove, pointerover
 * - Global: globalpointermove, globalmousemove, globaltouchmove
 * > [!IMPORTANT] Global events are fired when the pointer moves even if it is outside the bounds of the Container.
 * @see {@link EventMode} For interaction mode details
 * @see {@link Cursor} For cursor style options
 * @see {@link IHitArea} For hit area implementation
 * @category events
 * @standard
 */
export interface FederatedOptions
{
    /**
     * The cursor style to display when the mouse pointer is hovering over the object.
     * Accepts any valid CSS cursor value or custom cursor URL.
     * @example
     * ```ts
     * // Common cursor types
     * sprite.cursor = 'pointer';     // Hand cursor for clickable elements
     * sprite.cursor = 'grab';        // Grab cursor for draggable elements
     * sprite.cursor = 'crosshair';   // Precise cursor for selection
     * sprite.cursor = 'not-allowed'; // Indicate disabled state
     *
     * // Direction cursors
     * sprite.cursor = 'n-resize';    // North resize
     * sprite.cursor = 'ew-resize';   // East-west resize
     * sprite.cursor = 'nesw-resize'; // Northeast-southwest resize
     *
     * // Custom cursor with fallback
     * sprite.cursor = 'url("custom.png"), auto';
     * sprite.cursor = 'url("cursor.cur") 2 2, pointer'; // With hotspot offset
     * ```
     * @type {Cursor | string}
     * @default undefined
     * @see {@link EventSystem.cursorStyles} For setting global cursor styles
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor} MDN Cursor Documentation
     */
    cursor?: Cursor | (string & {});
    /**
     * Enable interaction events for the Container. Touch, pointer and mouse events are supported.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     *
     * // Enable standard interaction (like buttons)
     * sprite.eventMode = 'static';
     * sprite.on('pointerdown', () => console.log('clicked!'));
     *
     * // Enable for moving objects
     * sprite.eventMode = 'dynamic';
     * sprite.on('pointermove', () => updatePosition());
     *
     * // Disable all interaction
     * sprite.eventMode = 'none';
     *
     * // Only allow child interactions
     * sprite.eventMode = 'passive';
     * ```
     *
     * Available modes:
     *
     * - `'none'`: Ignores all interaction events, even on its children. Best for pure visuals.
     * - `'passive'`: **(default)** Does not emit events and ignores hit testing on itself and non-interactive
     * children. Interactive children will still emit events.
     * - `'auto'`: Does not emit events but is hit tested if parent is interactive. Same as `interactive = false` in v7.
     * - `'static'`: Emit events and is hit tested. Same as `interactive = true` in v7. Best for buttons/UI.
     * - `'dynamic'`: Like static but also receives synthetic events when pointer is idle. Best for moving objects.
     *
     * Performance tips:
     * - Use `'none'` for pure visual elements
     * - Use `'passive'` for containers with some interactive children
     * - Use `'static'` for standard UI elements
     * - Use `'dynamic'` only when needed for moving/animated elements
     * @since 7.2.0
     */
    eventMode?: EventMode;
    /**
     * Whether this object should fire UI events. This is an alias for `eventMode` set to `'static'` or `'passive'`.
     * Setting this to true will enable interaction events like `pointerdown`, `click`, etc.
     * Setting it to false will disable all interaction events on this object.
     * @see {@link Container.eventMode}
     * @example
     * ```ts
     * // Enable interaction events
     * sprite.interactive = true;  // Sets eventMode = 'static'
     * sprite.interactive = false; // Sets eventMode = 'passive'
     * ```
     */
    interactive?: boolean
    /**
     * Controls whether children of this container can receive pointer events.
     *
     * Setting this to false allows PixiJS to skip hit testing on all children,
     * improving performance for containers with many non-interactive children.
     * @default true
     * @example
     * ```ts
     * // Container with many visual-only children
     * const container = new Container();
     * container.interactiveChildren = false; // Skip hit testing children
     *
     * // Menu with interactive buttons
     * const menu = new Container();
     * menu.interactiveChildren = true; // Test all children
     * menu.addChild(button1, button2, button3);
     *
     * // Performance optimization
     * background.interactiveChildren = false;
     * foreground.interactiveChildren = true;
     * ```
     */
    interactiveChildren?: boolean;
    /**
     * Defines a custom hit area for pointer interaction testing. When set, this shape will be used
     * for hit testing instead of the container's standard bounds.
     * @example
     * ```ts
     * import { Rectangle, Circle, Sprite } from 'pixi.js';
     *
     * // Rectangular hit area
     * const button = new Sprite(texture);
     * button.eventMode = 'static';
     * button.hitArea = new Rectangle(0, 0, 100, 50);
     *
     * // Circular hit area
     * const icon = new Sprite(texture);
     * icon.eventMode = 'static';
     * icon.hitArea = new Circle(32, 32, 32);
     *
     * // Custom hit area with polygon
     * const custom = new Sprite(texture);
     * custom.eventMode = 'static';
     * custom.hitArea = new Polygon([0,0, 100,0, 100,100, 0,100]);
     *
     * // Custom hit testing logic
     * sprite.hitArea = {
     *     contains(x: number, y: number) {
     *         // Custom collision detection
     *         return x >= 0 && x <= width && y >= 0 && y <= height;
     *     }
     * };
     * ```
     * @remarks
     * - Takes precedence over the container's bounds for hit testing
     * - Can improve performance by simplifying collision checks
     * - Useful for irregular shapes or precise click areas
     */
    hitArea?: IHitArea | null;

    /**
     * Property-based event handler for the `click` event.
     * Fired when a pointer device (mouse, touch, etc.) completes a click action.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('click', (event) => {
     *    console.log('Sprite clicked at:', event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onclick = (event) => {
     *     console.log('Clicked at:', event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    onclick?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mousedown` event.
     * Fired when a mouse button is pressed while the pointer is over the object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mousedown', (event) => {
     *    sprite.alpha = 0.5; // Visual feedback
     *    console.log('Mouse button:', event.button);
     * });
     * // Using property-based handler
     * sprite.onmousedown = (event) => {
     *     sprite.alpha = 0.5; // Visual feedback
     *     console.log('Mouse button:', event.button);
     * };
     * ```
     * @default null
     */
    onmousedown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseenter` event.
     * Fired when the mouse pointer enters the bounds of the object. Does not bubble.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseenter', (event) => {
     *     sprite.scale.set(1.1);
     * });
     * // Using property-based handler
     * sprite.onmouseenter = (event) => {
     *     sprite.scale.set(1.1);
     * };
     * ```
     * @default null
     */
    onmouseenter?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseleave` event.
     * Fired when the pointer leaves the bounds of the display object. Does not bubble.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseleave', (event) => {
     *    sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onmouseleave = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onmouseleave?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mousemove` event.
     * Fired when the pointer moves while over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mousemove', (event) => {
     *    // Get coordinates relative to the sprite
     *   console.log('Local:', event.getLocalPosition(sprite));
     * });
     * // Using property-based handler
     * sprite.onmousemove = (event) => {
     *     // Get coordinates relative to the sprite
     *     console.log('Local:', event.getLocalPosition(sprite));
     * };
     * ```
     * @default null
     */
    onmousemove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globalmousemove` event.
     *
     * Fired when the mouse moves anywhere, regardless of whether the pointer is over this object.
     * The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('globalmousemove', (event) => {
     *     // Move sprite to mouse position
     *     sprite.position.copyFrom(event.global);
     * });
     * // Using property-based handler
     * sprite.onglobalmousemove = (event) => {
     *     // Move sprite to mouse position
     *     sprite.position.copyFrom(event.global);
     * };
     * ```
     * @default null
     * @remarks
     * - Fires even when the mouse is outside the object's bounds
     * - Useful for drag operations or global mouse tracking
     * - Must have `eventMode` set appropriately to receive events
     * - Part of the global move events family along with `globalpointermove` and `globaltouchmove`
     */
    onglobalmousemove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseout` event.
     * Fired when the pointer moves out of the bounds of the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseout', (event) => {
     *    sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onmouseout = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onmouseout?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseover` event.
     * Fired when the pointer moves onto the bounds of the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseover', (event) => {
     *      sprite.scale.set(1.1);
     * });
     * // Using property-based handler
     * sprite.onmouseover = (event) => {
     *     sprite.scale.set(1.1);
     * };
     * ```
     * @default null
     */
    onmouseover?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseup` event.
     * Fired when a mouse button is released over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseup', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onmouseup = (event) => {
     *      sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onmouseup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `mouseupoutside` event.
     * Fired when a mouse button is released outside the display object that initially
     * registered a mousedown.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('mouseupoutside', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onmouseupoutside = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onmouseupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointercancel` event.
     * Fired when a pointer device interaction is canceled or lost.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointercancel', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onpointercancel = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onpointercancel?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerdown` event.
     * Fired when a pointer device button (mouse, touch, pen, etc.) is pressed.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerdown', (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onpointerdown = (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    onpointerdown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerenter` event.
     * Fired when a pointer device enters the bounds of the display object. Does not bubble.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerenter', (event) => {
     *     sprite.scale.set(1.2);
     * });
     * // Using property-based handler
     * sprite.onpointerenter = (event) => {
     *     sprite.scale.set(1.2);
     * };
     * ```
     * @default null
     */
    onpointerenter?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerleave` event.
     * Fired when a pointer device leaves the bounds of the display object. Does not bubble.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     * // Using emitter handler
     * sprite.on('pointerleave', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onpointerleave = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onpointerleave?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointermove` event.
     * Fired when a pointer device moves while over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointermove', (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onpointermove = (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    onpointermove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globalpointermove` event.
     *
     * Fired when the pointer moves anywhere, regardless of whether the pointer is over this object.
     * The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('globalpointermove', (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onglobalpointermove = (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * };
     * ```
     * @default null
     * @remarks
     * - Fires even when the mouse is outside the object's bounds
     * - Useful for drag operations or global mouse tracking
     * - Must have `eventMode` set appropriately to receive events
     * - Part of the global move events family along with `globalpointermove` and `globaltouchmove`
     */
    onglobalpointermove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerout` event.
     * Fired when the pointer moves out of the bounds of the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerout', (event) => {
     *    sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onpointerout = (event) => {
     *    sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onpointerout?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerover` event.
     * Fired when the pointer moves over the bounds of the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerover', (event) => {
     *     sprite.scale.set(1.2);
     * });
     * // Using property-based handler
     * sprite.onpointerover = (event) => {
     *     sprite.scale.set(1.2);
     * };
     * ```
     * @default null
     */
    onpointerover?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointertap` event.
     * Fired when a pointer device completes a tap action (e.g., touch or mouse click).
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointertap', (event) => {
     *     console.log('Sprite tapped at:', event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onpointertap = (event) => {
     *     console.log('Sprite tapped at:', event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    onpointertap?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerup` event.
     * Fired when a pointer device button (mouse, touch, pen, etc.) is released.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerup', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onpointerup = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onpointerup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `pointerupoutside` event.
     * Fired when a pointer device button is released outside the bounds of the display object
     * that initially registered a pointerdown.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('pointerupoutside', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onpointerupoutside = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onpointerupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightclick` event.
     * Fired when a right-click (context menu) action is performed on the object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('rightclick', (event) => {
     *     console.log('Right-clicked at:', event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onrightclick = (event) => {
     *     console.log('Right-clicked at:', event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    onrightclick?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightdown` event.
     * Fired when a right mouse button is pressed down over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('rightdown', (event) => {
     *     sprite.scale.set(0.9);
     * });
     * // Using property-based handler
     * sprite.onrightdown = (event) => {
     *     sprite.scale.set(0.9);
     * };
     * ```
     * @default null
     */
    onrightdown?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightup` event.
     * Fired when a right mouse button is released over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('rightup', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onrightup = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onrightup?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `rightupoutside` event.
     * Fired when a right mouse button is released outside the bounds of the display object
     * that initially registered a rightdown.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('rightupoutside', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.onrightupoutside = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    onrightupoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `tap` event.
     * Fired when a tap action (touch) is completed on the object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('tap', (event) => {
     *     console.log('Sprite tapped at:', event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.ontap = (event) => {
     *     console.log('Sprite tapped at:', event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    ontap?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchcancel` event.
     * Fired when a touch interaction is canceled, such as when the touch is interrupted.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('touchcancel', (event) => {
     *     console.log('Touch canceled at:', event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.ontouchcancel = (event) => {
     *     console.log('Touch canceled at:', event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    ontouchcancel?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchend` event.
     * Fired when a touch interaction ends, such as when the finger is lifted from the screen.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('touchend', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.ontouchend = (event) => {
     *    sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    ontouchend?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchendoutside` event.
     * Fired when a touch interaction ends outside the bounds of the display object
     * that initially registered a touchstart.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('touchendoutside', (event) => {
     *     sprite.scale.set(1.0);
     * });
     * // Using property-based handler
     * sprite.ontouchendoutside = (event) => {
     *     sprite.scale.set(1.0);
     * };
     * ```
     * @default null
     */
    ontouchendoutside?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchmove` event.
     * Fired when a touch interaction moves while over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('touchmove', (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.ontouchmove = (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * };
     * ```
     * @default null
     */
    ontouchmove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `globaltouchmove` event.
     *
     * Fired when a touch interaction moves anywhere, regardless of whether the pointer is over this object.
     * The object must have `eventMode` set to 'static' or 'dynamic' to receive this event.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('globaltouchmove', (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * });
     * // Using property-based handler
     * sprite.onglobaltouchmove = (event) => {
     *     sprite.position.set(event.global.x, event.global.y);
     * };
     * ```
     * @default null
     * @remarks
     * - Fires even when the touch is outside the object's bounds
     * - Useful for drag operations or global touch tracking
     * - Must have `eventMode` set appropriately to receive events
     * - Part of the global move events family along with `globalpointermove` and `globalmousemove`
     */
    onglobaltouchmove?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `touchstart` event.
     * Fired when a touch interaction starts, such as when a finger touches the screen.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('touchstart', (event) => {
     *     sprite.scale.set(0.9);
     * });
     * // Using property-based handler
     * sprite.ontouchstart = (event) => {
     *     sprite.scale.set(0.9);
     * };
     * ```
     * @default null
     */
    ontouchstart?: FederatedEventHandler | null;

    /**
     * Property-based event handler for the `wheel` event.
     * Fired when the mouse wheel is scrolled while over the display object.
     * @example
     * ```ts
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     *
     * // Using emitter handler
     * sprite.on('wheel', (event) => {
     *     sprite.scale.x += event.deltaY * 0.01; // Zoom in/out
     *     sprite.scale.y += event.deltaY * 0.01; // Zoom in/out
     * });
     * // Using property-based handler
     * sprite.onwheel = (event) => {
     *     sprite.scale.x += event.deltaY * 0.01; // Zoom in/out
     *     sprite.scale.y += event.deltaY * 0.01; // Zoom in/out
     * };
     * ```
     * @default null
     */
    onwheel?: FederatedEventHandler<FederatedWheelEvent> | null;
}

/**
 * The options for the `addEventListener` method.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
 * @category events
 * @advanced
 */
export type AddListenerOptions = boolean | AddEventListenerOptions;
/**
 * The options for the `removeEventListener` method.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener}
 * @category events
 * @advanced
 */
export type RemoveListenerOptions = boolean | EventListenerOptions;

/**
 * Additional properties for a Container that is used for interaction events.
 * @category events
 * @advanced
 */
export interface IFederatedContainer extends FederatedOptions
{
    /** The parent of this event target. */
    readonly parent?: Container;

    /** The children of this event target. */
    readonly children?: ReadonlyArray<Container>;

    /** @private */
    _internalEventMode: EventMode;

    /**
     * Determines if the container is interactive or not
     * @returns {boolean} Whether the container is interactive or not
     * @since 7.2.0
     * @example
     * import { Sprite } from 'pixi.js';
     *
     * const sprite = new Sprite(texture);
     * sprite.eventMode = 'static';
     * sprite.isInteractive(); // true
     *
     * sprite.eventMode = 'dynamic';
     * sprite.isInteractive(); // true
     *
     * sprite.eventMode = 'none';
     * sprite.isInteractive(); // false
     *
     * sprite.eventMode = 'passive';
     * sprite.isInteractive(); // false
     *
     * sprite.eventMode = 'auto';
     * sprite.isInteractive(); // false
     */
    isInteractive: () => boolean;
    /**
     * Unlike `on` or `addListener` which are methods from EventEmitter, `addEventListener`
     * seeks to be compatible with the DOM's `addEventListener` with support for options.
     * @param {any} type - The type of event to listen to.
     * @param {any} listener - The listener callback or object.
     * @param {any} options - Listener options, used for capture phase.
     * @example
     * // Tell the user whether they did a single, double, triple, or nth click.
     * button.addEventListener('click', {
     *     handleEvent(e): {
     *         let prefix;
     *
     *         switch (e.detail) {
     *             case 1: prefix = 'single'; break;
     *             case 2: prefix = 'double'; break;
     *             case 3: prefix = 'triple'; break;
     *             default: prefix = e.detail + 'th'; break;
     *         }
     *
     *         console.log('That was a ' + prefix + 'click');
     *     }
     * });
     *
     * // But skip the first click!
     * button.parent.addEventListener('click', function blockClickOnce(e) {
     *     e.stopImmediatePropagation();
     *     button.parent.removeEventListener('click', blockClickOnce, true);
     * }, {
     *     capture: true,
     * });
     */
    addEventListener<K extends keyof AllFederatedEventMap>(
        type: K,
        listener: (e: AllFederatedEventMap[K]) => any,
        options?: AddListenerOptions
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddListenerOptions
    ): void;
    /**
     * Unlike `off` or `removeListener` which are methods from EventEmitter, `removeEventListener`
     * seeks to be compatible with the DOM's `removeEventListener` with support for options.
     * @param {K} type - The type of event the listener is bound to.
     * @param {any} listener - The listener callback or object.
     * @param {RemoveListenerOptions} options - The original listener options.
     * This is required to deregister a capture phase listener.
     */
    removeEventListener<K extends keyof AllFederatedEventMap>(
        type: K,
        listener: (e: AllFederatedEventMap[K]) => any,
        options?: RemoveListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: RemoveListenerOptions
    ): void;
    /**
     * Dispatch the event on this {@link Container} using the event's {@link EventBoundary}.
     *
     * The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.
     * @param {FederatedEvent} e - The event to dispatch.
     * @returns Whether the {@link FederatedEvent.preventDefault preventDefault}() method was not invoked.
     * @example
     * // Reuse a click event!
     * button.dispatchEvent(clickEvent);
     */
    dispatchEvent(e: FederatedEvent): boolean;
}

/** @internal */
export const FederatedContainer: IFederatedContainer = {
    onclick: null,
    onmousedown: null,
    onmouseenter: null,
    onmouseleave: null,
    onmousemove: null,
    onglobalmousemove: null,
    onmouseout: null,
    onmouseover:  null,
    onmouseup:  null,
    onmouseupoutside: null,
    onpointercancel: null,
    onpointerdown:  null,
    onpointerenter: null,
    onpointerleave:  null,
    onpointermove:  null,
    onglobalpointermove:  null,
    onpointerout:  null,
    onpointerover:  null,
    onpointertap:  null,
    onpointerup:  null,
    onpointerupoutside:  null,
    onrightclick:  null,
    onrightdown:  null,
    onrightup:  null,
    onrightupoutside:  null,
    ontap:  null,
    ontouchcancel:  null,
    ontouchend:  null,
    ontouchendoutside:  null,
    ontouchmove:  null,
    onglobaltouchmove:  null,
    ontouchstart:  null,
    onwheel:  null,
    get interactive()
    {
        return this.eventMode === 'dynamic' || this.eventMode === 'static';
    },
    set interactive(value: boolean)
    {
        this.eventMode = value ? 'static' : 'passive';
    },
    _internalEventMode: undefined,
    get eventMode()
    {
        return this._internalEventMode ?? EventSystem.defaultEventMode;
    },
    set eventMode(value)
    {
        this._internalEventMode = value;
    },
    isInteractive(): boolean
    {
        return this.eventMode === 'static' || this.eventMode === 'dynamic';
    },
    interactiveChildren: true,
    hitArea: null,
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: AddListenerOptions
    )
    {
        const capture = (typeof options === 'boolean' && options)
        || (typeof options === 'object' && options.capture);
        const signal = typeof options === 'object' ? options.signal : undefined;
        const once = typeof options === 'object' ? (options.once === true) : false;
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        const listenerFn = typeof listener === 'function' ? listener : listener.handleEvent;

        const emitter = (this as unknown as EventEmitter);

        if (signal)
        {
            signal.addEventListener('abort', () =>
            {
                emitter.off(type, listenerFn, context);
            });
        }

        if (once)
        {
            emitter.once(type, listenerFn, context);
        }
        else
        {
            emitter.on(type, listenerFn, context);
        }
    },
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: RemoveListenerOptions
    )
    {
        const capture = (typeof options === 'boolean' && options)
            || (typeof options === 'object' && options.capture);
        const context = typeof listener === 'function' ? undefined : listener;

        type = capture ? `${type}capture` : type;
        listener = typeof listener === 'function' ? listener : listener.handleEvent;

        (this as unknown as EventEmitter).off(type, listener, context);
    },
    dispatchEvent(e: Event): boolean
    {
        if (!(e instanceof FederatedEvent))
        {
            throw new Error('Container cannot propagate events outside of the Federated Events API');
        }

        e.defaultPrevented = false;
        e.path = null;
        e.target = this as Container;
        e.manager.dispatchEvent(e);

        return !e.defaultPrevented;
    }
};
