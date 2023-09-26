import type { PointData } from '../../src/maths/point/PointData';
import type { Bounds } from '../../src/scene/container/bounds/Bounds';
import type { Effect } from '../../src/scene/container/Effect';

// pads out the bounds by 10
export class DummyEffect implements Effect
{
    public pipe: string;
    public priority: number;
    public addBounds?(bounds: Bounds): void
    {
        bounds.pad(10);
    }

    public addLocalBounds?(bounds: Bounds): void
    {
        bounds.pad(10);
    }

    public containsPoint?(_point: PointData): boolean
    {
        return false;
    }

    public destroy(): void
    {
        // nothing to destroy
    }
}
