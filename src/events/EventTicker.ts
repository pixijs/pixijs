import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

import type { EventSystem } from './EventSystem';

/**
 * This class handles automatic firing of PointerEvents
 * in the case where the pointer is stationary for too long.
 * This is to ensure that hit-tests are still run on moving objects.
 * @since 7.2.0
 * @memberof events
 * @class EventsTicker
 */
class EventsTickerClass
{
    /** The event system. */
    public events: EventSystem;
    /** The DOM element to listen to events on. */
    public domElement: HTMLElement;
    /** The frequency that fake events will be fired. */
    public interactionFrequency = 10;

    private _deltaTime = 0;
    private _didMove = false;
    private _tickerAdded = false;
    private _pauseUpdate = true;

    /**
     * Initializes the event ticker.
     * @param events - The event system.
     */
    public init(events: EventSystem): void
    {
        this.removeTickerListener();
        this.events = events;
        this.interactionFrequency = 10;
        this._deltaTime = 0;
        this._didMove = false;
        this._tickerAdded = false;
        this._pauseUpdate = true;
    }

    /** Whether to pause the update checks or not. */
    get pauseUpdate(): boolean
    {
        return this._pauseUpdate;
    }

    set pauseUpdate(paused: boolean)
    {
        this._pauseUpdate = paused;
    }

    /** Adds the ticker listener. */
    public addTickerListener(): void
    {
        if (this._tickerAdded || !this.domElement)
        {
            return;
        }

        Ticker.system.add(this._tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);

        this._tickerAdded = true;
    }

    /** Removes the ticker listener. */
    public removeTickerListener(): void
    {
        if (!this._tickerAdded)
        {
            return;
        }

        Ticker.system.remove(this._tickerUpdate, this);

        this._tickerAdded = false;
    }

    /** Sets flag to not fire extra events when the user has already moved there mouse */
    public pointerMoved(): void
    {
        this._didMove = true;
    }

    /** Updates the state of interactive objects. */
    private _update(): void
    {
        if (!this.domElement || this._pauseUpdate)
        {
            return;
        }

        // if the user move the mouse this check has already been done using the mouse move!
        if (this._didMove)
        {
            this._didMove = false;

            return;
        }

        // eslint-disable-next-line dot-notation
        const rootPointerEvent = this.events['_rootPointerEvent'];

        if (this.events.supportsTouchEvents && (rootPointerEvent as PointerEvent).pointerType === 'touch')
        {
            return;
        }

        globalThis.document.dispatchEvent(new PointerEvent('pointermove', {
            clientX: rootPointerEvent.clientX,
            clientY: rootPointerEvent.clientY,
            pointerType: rootPointerEvent.pointerType,
            pointerId: rootPointerEvent.pointerId,
        }));
    }

    /**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link Ticker.system}.
     * @param ticker - The throttled ticker.
     */
    private _tickerUpdate(ticker: Ticker): void
    {
        this._deltaTime += ticker.deltaTime;

        if (this._deltaTime < this.interactionFrequency)
        {
            return;
        }

        this._deltaTime = 0;

        this._update();
    }
}

export const EventsTicker = new EventsTickerClass();
