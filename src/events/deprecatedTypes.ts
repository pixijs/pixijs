import type EventEmitter from 'eventemitter3';
import type { EventMode, FederatedOptions } from './FederatedEventTarget';

/**
 * A simplified shape of an interactive object for the `eventTarget` property of a {@link FederatedEvent}
 * @memberof events
 * @deprecated since 8.1.4
 */
export interface FederatedEventTarget extends EventEmitter, EventTarget, Required<FederatedOptions>
{
    /** The parent of this event target. */
    readonly parent?: FederatedEventTarget;

    /** The children of this event target. */
    readonly children?: ReadonlyArray<FederatedEventTarget>;

    _internalEventMode: EventMode;

    /** Returns true if the Container has interactive 'static' or 'dynamic' */
    isInteractive: () => boolean;

    // In Angular projects, zone.js is monkey patching the `EventTarget`
    // by adding its own `removeAllListeners(event?: string): void;` method,
    // so we have to override this signature when extending both `EventTarget` and `utils.EventEmitter`
    // to make it compatible with Angular projects
    // @see https://github.com/pixijs/pixijs/issues/8794

    /** Remove all listeners, or those of the specified event. */
    removeAllListeners(event?: string | symbol): this;
}
