import { FederatedPointerEvent } from './FederatedPointerEvent';
import { FederatedWheelEvent } from './FederatedWheelEvent';

export type FederatedEventsMap = {
    click: FederatedPointerEvent;
    mousedown: FederatedPointerEvent;
    mouseup: FederatedPointerEvent;
    mouseout: FederatedPointerEvent;
    mouseover: FederatedPointerEvent;
    rightdown: FederatedPointerEvent;
    rightup: FederatedPointerEvent;
    pointerout: FederatedPointerEvent;
    pointertap: FederatedPointerEvent;
    pointerover: FederatedPointerEvent;
    pointerup: FederatedPointerEvent;
    pointerdown: FederatedPointerEvent;
    touchstart: FederatedPointerEvent;
    touchend: FederatedPointerEvent;
    tap: FederatedPointerEvent;
    wheel: FederatedWheelEvent;
};
