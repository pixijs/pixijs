declare namespace PIXI {
    namespace utils {
// https://github.com/primus/eventemitter3
        type EventNames<T extends EventEmitter<any>> = keyof T['__events'];
        type EventArgs<T extends EventEmitter<any>, K extends EventNames<T>> = T['__events'][K];

        export type BaseEventTypes = { [K in string | symbol]: any[] };

        export interface ListenerFn<Args extends any[] = any[]>
        {
            (...args: Args): void;
        }

        /**
         * Minimal `EventEmitter` interface that is molded against the Node.js
         * `EventEmitter` interface.
         */
        export class EventEmitter<EventTypes extends BaseEventTypes = BaseEventTypes>
        {
            static prefixed: string | boolean;

            /**
             * A fake property to store the event types. Do not use it as value.
             */
            __events: EventTypes;

            /**
             * Return an array listing the events for which the emitter has registered
             * listeners.
             */
            eventNames(): Array<EventNames<this>>;

            /**
             * Return the listeners registered for a given event.
             */
            listeners<T extends EventNames<this>>(event: T): Array<ListenerFn<EventArgs<this, T>>>;

            /**
             * Return the number of listeners listening to a given event.
             */
            listenerCount(event: EventNames<this>): number;

            /**
             * Calls each of the listeners registered for a given event.
             */
            emit<T extends EventNames<this>>(event: T, ...args: EventArgs<this, T>): boolean;

            /**
             * Add a listener for a given event.
             */
            on<T extends EventNames<this>>(event: T, fn: ListenerFn<EventArgs<this, T>>, context?: any): this;
            addListener<T extends EventNames<this>>(event: T, fn: ListenerFn<EventArgs<this, T>>, context?: any): this;

            /**
             * Add a one-time listener for a given event.
             */
            once<T extends EventNames<this>>(event: T, fn: ListenerFn<EventArgs<this, T>>, context?: any): this;

            /**
             * Remove the listeners of a given event.
             */
            removeListener<T extends EventNames<this>>(event: T, fn?: ListenerFn<EventArgs<this, T>>, context?: any, once?: boolean): this;
            off<T extends EventNames<this>>(event: T, fn?: ListenerFn<EventArgs<this, T>>, context?: any, once?: boolean): this;

            /**
             * Remove all listeners, or those of the specified event.
             */
            removeAllListeners(event?: EventNames<this>): this;
        }
    }
}
