import type { PointData } from '../../maths/point/PointData';
import type { InputEvent } from '../events/InputEvent';
import type { WheelInputEvent } from '../events/WheelInputEvent';

function bootstrapEvent(
    event: WheelInputEvent | InputEvent,
    nativeEvent: WheelEvent | PointerEvent,
    mappedPosition: PointData
)
{
    event.originalEvent = null;
    event.nativeEvent = nativeEvent;
    event.type = nativeEvent.type;

    event.isTrusted = nativeEvent.isTrusted;
    event.srcElement = nativeEvent.srcElement;
    event.timeStamp = performance.now();

    event.altKey = nativeEvent.altKey;
    event.button = nativeEvent.button;
    event.buttons = nativeEvent.buttons;
    event.client.x = nativeEvent.clientX;
    event.client.y = nativeEvent.clientY;
    event.ctrlKey = nativeEvent.ctrlKey;
    event.metaKey = nativeEvent.metaKey;
    event.movement.x = nativeEvent.movementX;
    event.movement.y = nativeEvent.movementY;
    event.page.x = nativeEvent.pageX;
    event.page.y = nativeEvent.pageY;
    event.relatedTarget = null;
    event.shiftKey = nativeEvent.shiftKey;

    event.screen.copyFrom(mappedPosition);
    event.global.copyFrom(event.screen); // global = screen for top-level
    event.offset.copyFrom(event.screen); // EventBoundary recalculates using its rootTarget
}

/**
 * Normalizes the `nativeEvent` into a {@link InputEvent}.
 * @param event - The event to bootstrap.
 * @param nativeEvent - The native event to bootstrap from.
 * @param mappedPosition - globally mapped position.
 */
export function bootstrapPointerEvent(event: InputEvent, nativeEvent: PointerEvent, mappedPosition: PointData): InputEvent
{
    bootstrapEvent(event, nativeEvent, mappedPosition);

    event.pointerId = nativeEvent.pointerId;
    event.width = nativeEvent.width;
    event.height = nativeEvent.height;
    event.isPrimary = nativeEvent.isPrimary;
    event.pointerType = nativeEvent.pointerType;
    event.pressure = nativeEvent.pressure;
    event.tangentialPressure = nativeEvent.tangentialPressure;
    event.tiltX = nativeEvent.tiltX;
    event.tiltY = nativeEvent.tiltY;
    event.twist = nativeEvent.twist;

    if (event.type === 'pointerleave')
    {
        event.type = 'pointerout';
    }

    return event;
}

/**
 * Normalizes the `nativeEvent` into a {@link WheelInputEvent}.
 * @param event - The event to bootstrap.
 * @param nativeEvent - The native event to bootstrap from.
 * @param mappedPosition - globally mapped position.
 */
export function bootstrapWheelEvent(
    event: WheelInputEvent,
    nativeEvent: WheelEvent,
    mappedPosition: PointData
): WheelInputEvent
{
    bootstrapEvent(event, nativeEvent, mappedPosition);

    // When WheelEvent is triggered by scrolling with mouse wheel, reading WheelEvent.deltaMode
    // before deltaX/deltaY/deltaZ on Firefox will result in WheelEvent.DOM_DELTA_LINE (1),
    // while reading WheelEvent.deltaMode after deltaX/deltaY/deltaZ on Firefox or reading
    // in any order on other browsers will result in WheelEvent.DOM_DELTA_PIXEL (0).
    // Therefore, we need to read WheelEvent.deltaMode after deltaX/deltaY/deltaZ in order to
    // make its behavior more consistent across browsers.
    // @see https://github.com/pixijs/pixijs/issues/8970
    event.deltaX = nativeEvent.deltaX;
    event.deltaY = nativeEvent.deltaY;
    event.deltaZ = nativeEvent.deltaZ;
    event.deltaMode = nativeEvent.deltaMode;

    return event;
}
