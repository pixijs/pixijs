import type { FederatedPointerEvent } from './FederatedPointerEvent';
import type { FederatedWheelEvent } from './FederatedWheelEvent';

export type FederatedEventsMap = {
    click: FederatedPointerEvent;
    mousedown: FederatedPointerEvent;
    mousemove: FederatedPointerEvent;
    mouseout: FederatedPointerEvent;
    mouseover: FederatedPointerEvent;
    mouseup: FederatedPointerEvent;
    mouseupoutside: FederatedPointerEvent;
    pointerdown: FederatedPointerEvent;
    pointermove: FederatedPointerEvent;
    pointerout: FederatedPointerEvent;
    pointerover: FederatedPointerEvent;
    pointertap: FederatedPointerEvent;
    pointerup: FederatedPointerEvent;
    pointerupoutside: FederatedPointerEvent;
    rightclick: FederatedPointerEvent;
    rightdown: FederatedPointerEvent;
    rightup: FederatedPointerEvent;
    rightupoutside: FederatedPointerEvent;
    tap: FederatedPointerEvent;
    touchcancel: FederatedPointerEvent;
    touchend: FederatedPointerEvent;
    touchendoutside: FederatedPointerEvent;
    touchmove: FederatedPointerEvent;
    touchstart: FederatedPointerEvent;
    wheel: FederatedWheelEvent;
};
export type FederatedEventEmitterTypes = {
    [K in keyof FederatedEventsMap]: [FederatedEventsMap[K]];
};
