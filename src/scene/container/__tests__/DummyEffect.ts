import type { PointData } from '../../../maths/point/PointData';
import type { Bounds } from '../bounds/Bounds';
import type { Effect } from '../Effect';

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
