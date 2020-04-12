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

export type InteractionEvents = Record<InteractionEventTypes, [InteractionEvent]>;
