import { Bounds } from '../../../scene/container/bounds/Bounds';
import { Container } from '../Container';

import type { Point } from '../../../maths/point/Point';
import type { View, ViewObserver } from '../../../rendering/renderers/shared/view/View';
import type { ContainerOptions } from '../Container';

interface DummyViewOptions extends ContainerOptions
{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

const defaultOptions: DummyViewOptions = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
};

/** @internal */
export class DummyView extends Container implements View
{
    public owner: ViewObserver;
    public uid: number;
    public batched: boolean;
    public renderPipeId = 'dummy';
    public renderableUpdateRequested: boolean;
    public _roundPixels: 1 | 0 = 0;
    public _lastUsed = -1;

    public _onUpdate: () => void;
    public updateBounds: () => void;

    public containsPoint: (point: Point) => boolean;
    public destroy: () => void;
    public bounds: Bounds;
    constructor(options: DummyViewOptions = {})
    {
        options = { ...defaultOptions, ...options };

        const { x, y, width, height, ...rest } = options;

        super(rest);

        this.bounds = new Bounds(x, y, x + width, y + height);
    }

    public onViewUpdate(): void
    {
        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.onChildViewUpdate(this);
        }
    }

    get roundPixels(): boolean
    {
        return false;
    }

    set roundPixels(_value: boolean)
    {
        // nothing
    }
}
