import { Ticker, UPDATE_PRIORITY } from '@pixi/core';

import type { EventSystem } from './EventSystem';

/**
 * This class handles automatic firing of PointerEvents
 * in the case where the pointer is stationary for too long.
 * This is to ensure that hit-tests are still run on moving objects.
 * @memberof PIXI
 * @since 7.2.0
 * @see PIXI.EventsTicker
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
    private tickerAdded = false;
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
        this.tickerAdded = false;
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
        if (this.tickerAdded || !this.domElement)
        {
            return;
        }

        Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);

        this.tickerAdded = true;
    }

    /** Removes the ticker listener. */
    public removeTickerListener(): void
    {
        if (!this.tickerAdded)
        {
            return;
        }

        Ticker.system.remove(this.tickerUpdate, this);

        this.tickerAdded = false;
    }

    /** Sets flag to not fire extra events when the user has already moved there mouse */
    public pointerMoved(): void
    {
        this._didMove = true;
    }

    /** Updates the state of interactive objects. */
    private update(): void
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
        const rootPointerEvent = this.events['rootPointerEvent'];

        if (this.events.supportsTouchEvents && (rootPointerEvent as PointerEvent).pointerType === 'touch')
        {
            return;
        }

        globalThis.document.dispatchEvent(new PointerEvent('pointermove', {
            clientX: rootPointerEvent.clientX,
            clientY: rootPointerEvent.clientY,
        }));
    }

    /**
     * Updates the state of interactive objects if at least {@link PIXI.EventsTicker#interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     * @param deltaTime - time delta since the last call
     */
    private tickerUpdate(deltaTime: number): void
    {
        this._deltaTime += deltaTime;

        if (this._deltaTime < this.interactionFrequency)
        {
            return;
        }

        this._deltaTime = 0;

        this.update();
    }
}

/**
 * This class handles automatic firing of PointerEvents
 * in the case where the pointer is stationary for too long.
 * This is to ensure that hit-tests are still run on moving objects.
 * @memberof PIXI
 * @type {PIXI.EventsTickerClass}
 * @since 7.2.0
 */
export const EventsTicker = new EventsTickerClass();
