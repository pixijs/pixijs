import { settings } from '@pixi/settings';

/**
 * Should PixiJS use the PointerEvent API instead of MouseEvent API when generating interaction events.
 * This setting effects 'mouse' events only, not 'touch' events, which always use the TouchEvent API.
 * Advantages to this are using the modern api with the extra properties it comes with, such as 'pressure'.
 * It also allows 'touch' to work on Surface laptops that don't otherwise report as supporting touch.
 * Disadvantages are 'quirks' to how a PointerEvent works for mice, such a down and up events not being
 * fired if other buttons are already in a down state.
 * Whether this is enabled or disabled, you can still listen to normalised events such as 'pointerdown',
 * 'pointerup' - it's just that if it is disabled you will not be getting true PointerEvent behaviour.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
 *
 * @static
 * @constant
 * @name USE_POINTER_EVENT_API
 * @memberof PIXI.settings
 * @type {boolean}
 * @default false
 */
settings.USE_POINTER_EVENT_API = true;

export { settings };
