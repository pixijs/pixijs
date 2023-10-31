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
 * ### Event Modes
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
 *
 * ### Event Types
 *
 * PixiJS supports the following event types:
 *
 * | Event Type | Description |
 * |---|---|
 * | `pointercancel` | Fired when a pointer device button is released outside the display object
 * that initially registered a pointerdown. |
 * | `pointerdown` | Fired when a pointer device button is pressed on the display object. |
 * | `pointerenter` | Fired when a pointer device enters the display object. |
 * | `pointerleave` | Fired when a pointer device leaves the display object. |
 * | `pointermove` | Fired when a pointer device is moved while over the display object. |
 * | `globalpointermove` | Fired when a pointer device is moved, regardless of hit-testing the current object. |
 * | `pointerout` | Fired when a pointer device is moved off the display object. |
 * | `pointerover` | Fired when a pointer device is moved onto the display object. |
 * | `pointertap` | Fired when a pointer device is tapped twice on the display object. |
 * | `pointerup` | Fired when a pointer device button is released over the display object. |
 * | `pointerupoutside` | Fired when a pointer device button is released outside the display object
 * that initially registered a pointerdown. |
 * | `mousedown ` | Fired when a mouse button is pressed on the display object. |
 * | `mouseenter` | Fired when the mouse cursor enters the display object. |
 * | `mouseleave` | Fired when the mouse cursor leaves the display object. |
 * | `mousemove ` | Fired when the mouse cursor is moved while over the display object. |
 * | `globalmousemove` | Fired when a mouse is moved, regardless of hit-testing the current object. |
 * | `mouseout ` | Fired when the mouse cursor is moved off the display object. |
 * | `mouseover ` | Fired when the mouse cursor is moved onto the display object. |
 * | `mouseup ` | Fired when a mouse button is released over the display object. |
 * | `mouseupoutside ` | Fired when a mouse button is released outside the display object that initially registered a mousedown. |
 * | `click ` | Fired when a mouse button is clicked (pressed and released) over the display object. |
 * | `touchcancel ` | Fired when a touch point is removed outside of the display object that initially registered a touchstart. |
 * | `touchend ` | Fired when a touch point is removed from the display object. |
 * | `touchendoutside ` | Fired when a touch point is removed outside of the display object that initially registered a touchstart. |
 * | `touchmove ` | Fired when a touch point is moved along the display object. |
 * | `globaltouchmove` | Fired when a touch point is moved, regardless of hit-testing the current object. |
 * | `touchstart ` | Fired when a touch point is placed on the display object. |
 * | `tap ` | Fired when a touch point is tapped twice on the display object. |
 * | `wheel ` | Fired when a mouse wheel is spun over the display object. |
 * | `rightclick ` | Fired when a right mouse button is clicked (pressed and released) over the display object. |
 * | `rightdown ` | Fired when a right mouse button is pressed on the display object. |
 * | `rightup ` | Fired when a right mouse button is released over the display object. |
 * | `rightupoutside ` | Fired when a right mouse button is released outside the display object that initially registered a rightdown. |
 *
 *
 * ### Enabling Interaction
 *
 * Any Container-derived object (Sprite, Container, etc.) can become interactive simply by setting its `eventMode` property to any of
 * the eventModes listed above. Doing so will cause the object to emit interaction events that can be responded to in order to drive your project's behavior.
 *
 * Check out the [interaction example code](/examples/events/click).
 *
 * To respond to clicks and taps, bind to the events fired on the object, like so:
 *
 * ```javascript
 * let sprite = Sprite.from('/some/texture.png');
 * sprite.on('pointerdown', (event) => { alert('clicked!'); });
 * sprite.eventMode = 'static';
 * ```
 *
 * Check out the [Container](https://pixijs.download/release/docs/Container.html) for the list of interaction events supported.
 * @namespace events
 */
/* eslint-enable max-len */

extensions.add(EventSystem);
Container.mixin(FederatedContainer);
