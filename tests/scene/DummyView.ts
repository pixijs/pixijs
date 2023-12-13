import EventEmitter from 'eventemitter3';
import { Rectangle } from '../../src/maths/shapes/Rectangle';

import type { Point } from '../../src/maths/point/Point';
import type { View, ViewObserver } from '../../src/rendering/renderers/shared/view/View';
import type { Bounds, BoundsData } from '../../src/scene/container/bounds/Bounds';

export class DummyView extends EventEmitter implements View
{
    public owner: ViewObserver;
    public uid: number;
    public batched: boolean;
    public renderPipeId = 'dummy';
    public renderableUpdateRequested: boolean;
    public onUpdate: () => void;
    public get bounds(): BoundsData
    {
        return {
            minX: this.size.x,
            minY: this.size.y,
            maxX: this.size.x + this.size.width,
            maxY: this.size.y + this.size.height,
        };
    }
    public addBounds = (bounds: Bounds) =>
    {
        const dummyBounds = this.bounds;

        bounds.addFrame(
            dummyBounds.minX,
            dummyBounds.minY,
            dummyBounds.maxX,
            dummyBounds.maxY,
        );
    };
    public containsPoint: (point: Point) => boolean;
    public destroy: () => void;
    public size: Rectangle;
    constructor(x = 0, y = 0, width = 100, height = 100)
    {
        super();
        this.size = new Rectangle(x, y, width, height);
    }
}
