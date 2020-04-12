import type { InteractionEvent } from './InteractionEvent';

type InteractionPointerEvents = 'pointerdown'
    | 'pointercancel'
    | 'pointerup'
    | 'pointertap'
    | 'pointerupoutside'
    | 'pointermove'
    | 'pointerover'
    | 'pointerout';

type InteractionTouchEvents = 'touchstart'
    | 'touchcancel'
    | 'touchend'
    | 'touchendoutside'
    | 'touchmove'
    | 'tap';

type InteractionMouseEvents = 'rightdown'
    | 'mousedown'
    | 'rightup'
    | 'mouseup'
    | 'rightclick'
    | 'click'
    | 'rightupoutside'
    | 'mouseupoutside'
    | 'mousemove'
    | 'mouseover'
    | 'mouseout';

type InteractionEventTypes = InteractionPointerEvents | InteractionTouchEvents | InteractionMouseEvents;

// a better declaration, but more difficult to generate using JSDoc
// export type InteractionEvents = { [E in keyof InteractionEventTypes]: [InteractionEvent & { type: E }] };

export type InteractionEvents = Record<InteractionEventTypes, [InteractionEvent]>;

/**
 * @typedef InteractionPointerEvents
 * @type {'pointerdown'|'pointercancel'|'pointerup'|'pointertap'|'pointerupoutside'|'pointermove'|'pointerover'|'pointerout'}
 * @memberof PIXI.interaction
 */

/**
 * @typedef InteractionTouchEvents
 * @type {'touchstart'|'touchcancel'|'touchend'|'touchendoutside'|'touchmove'|'tap'}
 * @memberof PIXI.interaction
 */

/**
 * @typedef InteractionMouseEvents
 * @type {'rightdown'|'mousedown'|'rightup'|'mouseup'|'rightclick'|'click'|
 *     'rightupoutside'|'mouseupoutside'|'mousemove'|'mouseover'|'mouseout'}
 * @memberof PIXI.interaction
 */

/**
 * @typedef InteractionEventTypes
 * @type {InteractionPointerEvents|InteractionTouchEvents|InteractionMouseEvents}
 * @memberof PIXI.interaction
 */

/**
 * @typedef InteractionEvents
 * @type {Record<InteractionEventTypes, Tuple<PIXI.interaction.InteractionEvent>>}
 * @memberof PIXI.interaction
 */

/**
 * @interface DisplayObjectEvents
 * @variation 2
 * @extends PIXI.interaction.InteractionEvents
 * @memberof PIXI
 */
