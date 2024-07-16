import type { Container } from '../../scene/container/Container';
import type { InputEvent } from '../events/InputEvent';
import type { WheelInputEvent } from '../events/WheelInputEvent';
import type { Input } from '../Input';

function emit(container: Container, newEvent: InputEvent | WheelInputEvent, type: Parameters<Input['emit']>[0]): void
{
    newEvent.currentTarget = container;
    if (container._input?.interactive)
    {
        container._input[`on${type}`]?.(newEvent as InputEvent);
        container._input.emit(type, newEvent);
    }
}

export function manuallyEmit(
    containers: Container[],
    newEvent: InputEvent | WheelInputEvent,
    type: Parameters<Input['emit']>[0]
): void
{
    for (let i = 0; i < containers.length; i++)
    {
        emit(containers[i], newEvent, type);
    }
}

export function dispatchEvent(event: InputEvent | WheelInputEvent, type: Parameters<Input['emit']>[0])
{
    if (!event.path)
    {
        return false;
    }

    // loop through the path an emit the event
    for (let i = 0; i < event.path.length; i++)
    {
        const target = event.path[i];

        if (event.propagationStopped)
        {
            break;
        }

        event.currentTarget = target;
        if (target._input?.interactive)
        {
            target._input[`on${type}`]?.(event as InputEvent);
            target._input.emit(type, event);
        }
    }

    return !event.propagationStopped;
}
