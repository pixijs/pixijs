import type { InputEvent } from '../events/InputEvent';
import type { WheelInputEvent } from '../events/WheelInputEvent';

function copyPointerData(from: InputEvent, to: InputEvent): void
{
    to.pointerId = from.pointerId;
    to.width = from.width;
    to.height = from.height;
    to.isPrimary = from.isPrimary;
    to.pointerType = from.pointerType;
    to.pressure = from.pressure;
    to.tangentialPressure = from.tangentialPressure;
    to.tiltX = from.tiltX;
    to.tiltY = from.tiltY;
    to.twist = from.twist;
}

function copyMouseEventData(from: InputEvent | WheelInputEvent, to: InputEvent | WheelInputEvent): void
{
    to.altKey = from.altKey;
    to.button = from.button;
    to.buttons = from.buttons;
    to.client.copyFrom(from.client);
    to.ctrlKey = from.ctrlKey;
    to.metaKey = from.metaKey;
    to.movement.copyFrom(from.movement);
    to.screen.copyFrom(from.screen);
    to.shiftKey = from.shiftKey;
    to.global.copyFrom(from.global);
    to.isTrusted = from.isTrusted;
    to.srcElement = from.srcElement;
    to.timeStamp = performance.now();
    to.type = from.type;
    to.detail = from.detail;
    to.page.copyFrom(from.page);
}

/**
 * Copies data from {@code from} into {@code to}.
 * @param from - The event to copy data from.
 * @param to - The event to copy data into.
 */
export function copyPointerEvent(from: InputEvent, to: InputEvent): void
{
    copyPointerData(from, to);
    copyMouseEventData(from, to);
}

/**
 * Copies data from {@code from} into {@code to}.
 * @param from - The event to copy data from.
 * @param to - The event to copy data into.
 */
export function copyWheelEvent(from: WheelInputEvent, to: WheelInputEvent): void
{
    copyMouseEventData(from, to);
    to.deltaMode = from.deltaMode;
    to.deltaX = from.deltaX;
    to.deltaY = from.deltaY;
    to.deltaZ = from.deltaZ;
}
