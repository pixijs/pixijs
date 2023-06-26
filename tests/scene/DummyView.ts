import EventEmitter from 'eventemitter3';
import { Rectangle } from '../../src';

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
        bounds.addFrame(this.size.x, this.size.y, this.size.width, this.size.height);
    };
    containsPoint: (point: Point) => boolean;
    destroy: () => void;
    size: Rectangle;
    constructor(x = 0, y = 0, width = 100, height = 100)
    {
        super();
        this.size = new Rectangle(x, y, width, height);
    }
}
