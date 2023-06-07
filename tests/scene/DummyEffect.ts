import type { PointData } from '../../src/maths/PointData';
import type { Bounds } from '../../src/rendering/scene/bounds/Bounds';
import type { Effect } from '../../src/rendering/scene/Effect';

// pads out the bounds by 10
export class DummyEffect implements Effect
{
    pipe: string;
    priority: number;
    addBounds?(bounds: Bounds): void
    {
        bounds.pad(10);
    }

    addLocalBounds?(bounds: Bounds): void
    {
        bounds.pad(10);
    }

    containsPoint?(_point: PointData): boolean
    {
        return false;
    }
}
