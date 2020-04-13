// ESLint prefers `import` statement to triple-slash reference,
// but using `import` will break the building process

// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../types/events.d.ts"/>

/* eslint-disable */
/*
    - `eventemitter3` uses CommonJS export
    - PIXI uses module exports, but thanks to `"esModuleInterop": true` in tsconfig.json this works
    - Unfortunately `tsconfig.docs.json` (used for documentation genereation) exports to ES6
      which for reasons unknown just doesn't work even with the interop above
    - Changing docs' export to ES5 fixes the problem with `eventemitter3` but causes a lot
      of other bugs when building for docs, therefore it's not a solution
    - Adding @ts-ignore to this line makes docs build stop complaining about something it doesn't
      have to care about, but then linter's rule is broken
    - Therefore the whole thing is wrapped in eslint-disable just to be able to progress with this change
    - This is a temporary measure. Possibly the best solution would be custom typings for `eventemitter3`
    stored in this very repository.
 */
// @ts-ignore
import _EventEmitter from 'eventemitter3';
/* eslint-enable */

export type BaseEventTypes = PIXI.utils.BaseEventTypes;

type EventEmitter<EventTypes extends BaseEventTypes = BaseEventTypes> = PIXI.utils.EventEmitter<EventTypes>;

/**
 * A high performance event emitter
 *
 * @see {@link https://github.com/primus/eventemitter3}
 *
 * @memberof PIXI.utils
 * @class EventEmitter
 * @type {EventEmitter}
 */
// first cast it to `any` because it's missing the `__events` property
const EventEmitter = _EventEmitter as any as {
    prefixed: string | boolean;

    new<EventTypes extends BaseEventTypes = BaseEventTypes>(): EventEmitter<EventTypes>;
};

export { EventEmitter };
