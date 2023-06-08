import EventEmitter from 'eventemitter3';

import type { Point } from '../../src/maths/Point';
import type { View, ViewObserver } from '../../src/rendering/renderers/shared/View';
import type { Bounds } from '../../src/rendering/scene/bounds/Bounds';

export class DummyView extends EventEmitter implements View
{
    owner: ViewObserver;
    uid: number;
    batched: boolean;
    type = 'dummy';
    renderableUpdateRequested: boolean;
    onUpdate: () => void;
    addBounds = (bounds: Bounds) =>
    {
        bounds.addFrame(0, 0, 100, 100);
    };
    containsPoint: (point: Point) => boolean;
    destroy: () => void;
}
