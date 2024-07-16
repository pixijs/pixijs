import { Container } from '../scene/container/Container';
import { warn } from '../utils/logging/warn';

import type { EventMode } from '../events/FederatedEventTarget';

const warnDeprecated = (
    old: string,
    updated: string,
    additional?: string
): void =>
    warn(`The "${old}" event is deprecated. Use "${updated}" instead. ${additional || ''}`);

const warnRemoved = (
    event: string,
    updated: string,
    additional?: string
): void =>
    warn(`The "${event}" event is no longer supported. Try using "${updated}" instead. ${additional || ''}`);

const eventMapping: Record<string, { event: string | null, message: (() => void) | string | null }> = {
    click: {
        event: 'pointertap',
        message: warnDeprecated.bind(null, 'click', 'pointertap'),
    },
    mousedown: {
        event: 'pointerdown',
        message: warnDeprecated.bind(
            null,
            'mousedown',
            'pointerdown',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mouseenter: {
        event: 'pointerover',
        message: warnRemoved.bind(
            null,
            'mouseenter',
            'pointerover',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mouseleave: {
        event: 'pointerout',
        message: warnRemoved.bind(
            null,
            'mouseleave',
            'pointerout',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mousemove: {
        event: 'pointermove',
        message: warnDeprecated.bind(null, 'mousemove', 'pointermove'),
    },
    globalmousemove: {
        event: 'globalpointermove',
        message: warnDeprecated.bind(null, 'globalmousemove', 'globalpointermove'),
    },
    mouseout: {
        event: 'pointerout',
        message: warnDeprecated.bind(
            null,
            'mouseout',
            'pointerout',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mouseover: {
        event: 'pointerover',
        message: warnDeprecated.bind(
            null,
            'mouseover',
            'pointerover',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mouseup: {
        event: 'pointerup',
        message: warnDeprecated.bind(
            null,
            'mouseup',
            'pointerup',
            'You can use "event.type" to check the pointer type'
        ),
    },
    mouseupoutside: {
        event: 'pointerupoutside',
        message: warnDeprecated.bind(
            null,
            'mouseupoutside',
            'pointerupoutside',
            'You can use "event.type" to check the pointer type'
        ),
    },
    pointercancel: {
        event: 'pointerup',
        message: warnRemoved.bind(null, 'pointercancel', 'pointerup'),
    },
    pointerenter: {
        event: 'pointerover',
        message: warnRemoved.bind(null, 'pointerenter', 'pointerover'),
    },
    pointerleave: {
        event: 'pointerout',
        message: warnRemoved.bind(null, 'pointerleave', 'pointerout'),
    },
    rightclick: {
        event: 'pointertap',
        message: warnDeprecated.bind(
            null,
            'rightclick',
            'pointertap',
            'You can use "event.button" to check the button'
        ),
    },
    rightdown: {
        event: 'pointerdown',
        message: warnDeprecated.bind(
            null,
            'rightdown',
            'pointerdown',
            'You can use "event.button" to check the button'
        ),
    },
    rightup: {
        event: 'pointerup',
        message: warnDeprecated.bind(
            null,
            'rightup',
            'pointerup',
            'You can use "event.button" to check the button'
        ),
    },
    rightupoutside: {
        event: 'pointerupoutside',
        message: warnDeprecated.bind(
            null,
            'rightupoutside',
            'pointerupoutside',
            'You can use "event.button" to check the button'
        ),
    },
    tap: {
        event: 'pointertap',
        message: warnDeprecated.bind(null, 'tap', 'pointertap'),
    },
    touchcancel: {
        event: 'pointerup',
        message: warnRemoved.bind(null, 'touchcancel', 'pointerup'),
    },
    touchend: {
        event: 'pointerup',
        message: warnDeprecated.bind(null, 'touchend', 'pointerup'),
    },
    touchendoutside: {
        event: 'pointerupoutside',
        message: warnDeprecated.bind(null, 'touchendoutside', 'pointerupoutside'),
    },
    touchmove: {
        event: 'pointermove',
        message: warnDeprecated.bind(null, 'touchmove', 'pointermove'),
    },
    globaltouchmove: {
        event: 'globalpointermove',
        message: warnDeprecated.bind(
            null,
            'globaltouchmove',
            'globalpointermove'
        ),
    },
    touchstart: {
        event: 'pointerdown',
        message: warnRemoved.bind(null, 'touchstart', 'pointerdown'),
    },
    wheel: { event: null, message: '"wheel" is not supported' },

    pointermove: { event: 'pointermove', message: null },
    globalpointermove: { event: 'globalpointermove', message: null },
    pointerover: { event: 'pointerover', message: null },
    pointerout: { event: 'pointerout', message: null },
    pointerup: { event: 'pointerup', message: null },
    pointerupoutside: { event: 'pointerupoutside', message: null },
    pointerdown: { event: 'pointerdown', message: null },
    pointertap: { event: 'pointertap', message: null },
};

let applied = false;

export function applyInputEventsCompatibility()
{
    if (applied)
    {
        return;
    }
    applied = true;

    const originalOn = Container.prototype.on;

    Container.prototype.on = function onCompat(event, fn, context)
    {
        const eventType = event as keyof typeof eventMapping;

        if (eventMapping[eventType])
        {
            if (eventMapping[eventType].message)
            {
                const message = eventMapping[eventType].message;

                if (typeof message === 'string')
                {
                    warn(message);
                }
                else
                {
                    message();
                }
            }

            if (!eventMapping[eventType].event)
            {
                return this;
            }

            return this.input.on(eventMapping[eventType].event as any, fn, context) as any;
        }

        return originalOn.call(this, event, fn, context);
    };

    const originalOff = Container.prototype.off;

    Container.prototype.off = function offCompat(event, fn, context)
    {
        const eventType = event as keyof typeof eventMapping;

        if (eventMapping[eventType])
        {
            event = eventMapping[eventType].event as any;

            return this.input.off(event as any, fn, context) as any;
        }

        return originalOff.call(this, event, fn, context);
    };

    const overrides: Partial<Container> = {
        isInteractive(): boolean
        {
            return !this.input.interactive;
        },
        get eventMode()
        {
            return !this.input.interactive
                ? ('dynamic' as EventMode)
                : ('passive' as EventMode);
        },
        set eventMode(val: EventMode)
        {
            if (val === 'dynamic' || val === 'static')
            {
                this.input.interactive = true;
            }
            else
            {
                this.input.interactive = false;
            }
        },
        get cursor()
        {
            return this.input.cursor;
        },
        set cursor(val: string)
        {
            this.input.cursor = val;
        },
    };

    Object.defineProperties(
        Container.prototype,
        Object.getOwnPropertyDescriptors(overrides)
    );
}
