import type { FederatedPointerEvent } from './FederatedPointerEvent';
import type { FederatedWheelEvent } from './FederatedWheelEvent';

export type FederatedEventMap = {
    click: FederatedPointerEvent;
    mousedown: FederatedPointerEvent;
    mouseenter: FederatedPointerEvent;
    mouseleave: FederatedPointerEvent;
    mousemove: FederatedPointerEvent;
    mouseout: FederatedPointerEvent;
    mouseover: FederatedPointerEvent;
    mouseup: FederatedPointerEvent;
    mouseupoutside: FederatedPointerEvent;
    pointercancel: FederatedPointerEvent;
    pointerdown: FederatedPointerEvent;
    pointerenter: FederatedPointerEvent;
    pointerleave: FederatedPointerEvent;
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

export type GlobalFederatedEventMap = {
    globalmousemove: FederatedPointerEvent;
    globalpointermove: FederatedPointerEvent;
    globaltouchmove: FederatedPointerEvent;
};

export type AllFederatedEventMap = FederatedEventMap & GlobalFederatedEventMap;

export type FederatedEventEmitterTypes = {
    [K in keyof FederatedEventMap as K | `${K}capture`]: [event: FederatedEventMap[K]];
} & {
    [K in keyof GlobalFederatedEventMap]: [event: GlobalFederatedEventMap[K]];
} & {

    // The following is a hack to allow any custom event while maintaining type safety.
    // For some reason, the tsc compiler gets angry about error TS1023
    // "An index signature parameter type must be either 'string' or 'number'."
    // This is really odd since ({}&string) should interpret as string, but then again
    // there is some black magic behind why this works in the first place.
    // Closest thing to an explanation:
    // https://stackoverflow.com/questions/70144348/why-does-a-union-of-type-literals-and-string-cause-ide-code-completion-wh
    //
    // Side note, we disable @typescript-eslint/ban-types since {}&string is the only syntax that works.
    // Nor of the Record/unknown/never alternatives work.
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K: ({} & string) | ({} & symbol)]: any;
};
