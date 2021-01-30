import { DisplayObject } from '@pixi/display';
import { FederatedEvent } from './FederatedEvent';

import type { EventEmitter } from '@pixi/utils';

export interface FederatedEventTarget extends EventEmitter, EventTarget {
    readonly parent?: FederatedEventTarget;
    readonly children?: ReadonlyArray<FederatedEventTarget>;
}

export const FederatedDisplayObject: Omit<FederatedEventTarget, 'parent' | 'children' | keyof EventEmitter>
= {
    addEventListener: () => {
        // TODO
    },
    removeEventListener: () => {
        // TODO
    },

    dispatchEvent(e: Event): boolean
    {
        if (!(e instanceof FederatedEvent))
        {
            throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
        }

        return false;
    }
};

DisplayObject.mixin(FederatedDisplayObject);
