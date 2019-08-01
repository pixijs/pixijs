declare namespace PIXI {
    namespace utils {
// https://github.com/primus/eventemitter3
        export interface EventEmitter {
            /**
             * Return an array listing the events for which the emitter has registered listeners.
             *
             * @returns {(string | symbol)[]}
             */
            eventNames(): Array<(string | symbol)>;

            /**
             * Return the listeners registered for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @returns {Function[]}
             */
            //tslint:disable-next-line:ban-types forbidden-types
            listeners(event: string | symbol): Array<Function>;

            /**
             * Return the number of listeners listening to a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @returns {number}
             */
            listenerCount(event: string | symbol): number;

            /**
             * Calls each of the listeners registered for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {...*} args Arguments that are passed to registered listeners
             * @returns {boolean} `true` if the event had listeners, else `false`.
             */
            emit(event: string | symbol, ...args: any[]): boolean;

            /**
             * Add a listener for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn The listener function.
             * @param {*} [context=this] The context to invoke the listener with.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            on(event: string | symbol, fn: Function, context?: any): this;

            /**
             * Add a one-time listener for a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn The listener function.
             * @param {*} [context=this] The context to invoke the listener with.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            once(event: string | symbol, fn: Function, context?: any): this;

            /**
             * Remove the listeners of a given event.
             *
             * @param {(string | symbol)} event The event name.
             * @param {Function} fn Only remove the listeners that match this function.
             * @param {*} context Only remove the listeners that have this context.
             * @param {boolean} once Only remove one-time listeners.
             * @returns {EventEmitter} `this`.
             */
            //tslint:disable-next-line:ban-types forbidden-types
            removeListener(event: string | symbol, fn?: Function, context?: any, once?: boolean): this;

            /**
             * Remove all listeners, or those of the specified event.
             *
             * @param {(string | symbol)} event The event name.
             * @returns {EventEmitter} `this`.
             */
            removeAllListeners(event?: string | symbol): this;

            /**
             * Alias method for `removeListener`
             */
            //tslint:disable-next-line:ban-types forbidden-types
            off(event: string | symbol, fn?: Function, context?: any, once?: boolean): this;

            /**
             * Alias method for `on`
             */
            //tslint:disable-next-line:ban-types forbidden-types
            addListener(event: string | symbol, fn: Function, context?: any): this;
        }
    }

    namespace interaction {
        type InteractionPointerEvents = "pointerdown" | "pointercancel" | "pointerup" | "pointertap" | "pointerupoutside" | "pointermove" | "pointerover" | "pointerout";
        type InteractionTouchEvents = "touchstart" | "touchcancel" | "touchend" | "touchendoutside" | "touchmove" | "tap";
        type InteractionMouseEvents = "rightdown" | "mousedown" | "rightup" | "mouseup" | "rightclick" | "click" | "rightupoutside" | "mouseupoutside" | "mousemove" | "mouseover" | "mouseout";
        type InteractionPixiEvents = "added" | "removed";
        type InteractionEventTypes = InteractionPointerEvents | InteractionTouchEvents | InteractionMouseEvents | InteractionPixiEvents;
    }

    export interface DisplayObject {
        on(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        on(event: string | symbol, fn: Function, context?: any): this;
        once(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        once(event: string | symbol, fn: Function, context?: any): this;
        removeListener(event: interaction.InteractionEventTypes, fn?: (event: interaction.InteractionEvent) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        removeListener(event: string | symbol, fn?: Function, context?: any): this;
        removeAllListeners(event?: interaction.InteractionEventTypes): this;
        removeAllListeners(event?: string | symbol): this;
        off(event: interaction.InteractionEventTypes, fn?: (event: interaction.InteractionEvent) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        off(event: string | symbol, fn?: Function, context?: any): this;
        addListener(event: interaction.InteractionEventTypes, fn: (event: interaction.InteractionEvent) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        addListener(event: string | symbol, fn: Function, context?: any): this;
    }

    export interface Container {
        once(event: "added" | "removed", fn: (displayObject: DisplayObject) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        once(event: string, fn: Function, context?: any): this;
        on(event: "added" | "removed", fn: (displayObject: DisplayObject) => void, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        on(event: string, fn: Function, context?: any): this;
        //tslint:disable-next-line:ban-types forbidden-types
        off(event: "added" | "removed" | string, fn?: Function, context?: any): this;
    }
}
