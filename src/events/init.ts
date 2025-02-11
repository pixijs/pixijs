import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { EventSystem } from './EventSystem';
import { FederatedContainer } from './FederatedEventTarget';

/* eslint-disable max-len */
/**
 * PixiJS is primarily a rendering system, but it also includes support for interactivity.
 * Adding support for mouse and touch events to your project is simple and consistent.
 *
 * The new event-based system that replaced InteractionManager from v6 has expanded the definition of what a
 * Container means to be interactive. With this we have introduced `eventMode` which allows you to control
 * how an object responds to interaction events.
 * This is similar to the `interactive` property in v6 but with more options.
 *
 * <details id="enabling-interaction">
 * <summary>Enabling Interaction</summary>
 *
 * Any Container-derived object (Sprite, Container, etc.) can become interactive simply by setting its `eventMode` property to any of
 * the {@link events.EventMode} values. Doing so will cause the object to emit interaction events that can be responded to in order to drive your project's behavior.
 *
 * Check out the [interaction example code](/examples/events/click).
 *
 * Container-derived objects are based on {@link https://www.npmjs.com/package/eventemitter3|EventEmitter3}
 * so you can use `on()`, `once()`, `off()` to listen to events.
 *
 * For example to respond to clicks and taps, bind to an object ike so:
 *
 * ```javascript
 * let sprite = Sprite.from('/some/texture.png');
 *
 * sprite.eventMode = 'static'; // similar to `sprite.interactive = true` in v6
 * sprite.on('pointerdown', (event) => { alert('clicked!'); });
 * ```
 *
 * Check out the **EventTypes** section below for the full list of interaction events supported.
 * </details>
 *
 * <details id="event-modes">
 * <summary>Event Modes</summary>
 *
 * The new event-based system that replaced InteractionManager from v6 has expanded the definition of what a Container
 *  means to be interactive. With this we have introduced `eventMode` which allows you to control how an object responds
 * to interaction events. This is similar to the `interactive` property in v6 but with more options.
 *
 * | event mode | Description |
 * |---|---|
 * | `none` | Ignores all interaction events, similar to CSS's `pointer-events: none`, good optimization for non-interactive children |
 * |  `passive`  | Does not emit events and ignores hit testing on itself but does allow for events and hit testing only its interactive children. If you want to be compatible with v6, set this as your default `eventMode` (see options in Renderer, Application, etc) |
 * |  `auto`  | Does not emit events and but is hit tested if parent is interactive. Same as `interactive = false` in v7 |
 * |  `static`  | Emit events and is hit tested. Same as `interaction = true` in v7, useful for objects like buttons that do not move. |
 * |  `dynamic` | Emits events and is hit tested but will also receive mock interaction events fired from a ticker to allow for interaction when the mouse isn't moving. This is useful for elements that independently moving or animating. |
 * </details>
 *
 * <details id="event-types">
 * <summary>Event Types</summary>
 *
 * Pixi supports the following event types for interactive objects:
 *
 * | Event Type | Fired When |
 * |---|---|
 * | `pointercancel` | Pointer device button is released outside the display object
 * that initially registered a pointerdown. |
 * | `pointerdown` | Pointer device button is pressed on the display object. |
 * | `pointerenter` | Pointer device enters the display object. |
 * | `pointerleave` | Pointer device leaves the display object. |
 * | `pointermove` | Pointer device is moved while over the display object. |
 * | `globalpointermove` | Pointer device is moved, regardless of hit-testing the current object. |
 * | `pointerout` | Pointer device is moved off the display object. |
 * | `pointerover` | Pointer device is moved onto the display object. |
 * | `pointertap` | Pointer device is tapped twice on the display object. |
 * | `pointerup` | Pointer device button is released over the display object. |
 * | `pointerupoutside` | Pointer device button is released outside the display object
 * that initially registered a pointerdown. |
 * | `mousedown ` | Mouse button is pressed on the display object. |
 * | `mouseenter` | Mouse cursor enters the display object. |
 * | `mouseleave` | Mouse cursor leaves the display object. |
 * | `mousemove ` | Mouse cursor is moved while over the display object. |
 * | `globalmousemove` | Mouse is moved, regardless of hit-testing the current object. |
 * | `mouseout ` | Mouse cursor is moved off the display object. |
 * | `mouseover ` | Mouse cursor is moved onto the display object. |
 * | `mouseup ` | Mouse button is released over the display object. |
 * | `mouseupoutside ` | Mouse button is released outside the display object that initially registered a mousedown. |
 * | `click ` | Mouse button is clicked (pressed and released) over the display object. |
 * | `touchcancel ` | Touch point is removed outside of the display object that initially registered a touchstart. |
 * | `touchend ` | Touch point is removed from the display object. |
 * | `touchendoutside ` | Touch point is removed outside of the display object that initially registered a touchstart. |
 * | `touchmove ` | Touch point is moved along the display object. |
 * | `globaltouchmove` | Touch point is moved, regardless of hit-testing the current object. |
 * | `touchstart ` | Touch point is placed on the display object. |
 * | `tap ` | Touch point is tapped twice on the display object. |
 * | `wheel ` | Mouse wheel is spun over the display object. |
 * | `rightclick ` | Right mouse button is clicked (pressed and released) over the display object. |
 * | `rightdown ` | Right mouse button is pressed on the display object. |
 * | `rightup ` | Right mouse button is released over the display object. |
 * | `rightupoutside ` | Right mouse button is released outside the display object that initially registered a rightdown. |
 * </details>
 * @namespace events
 */
/* eslint-enable max-len */

extensions.add(EventSystem);
extensions.mixin(Container, FederatedContainer);
