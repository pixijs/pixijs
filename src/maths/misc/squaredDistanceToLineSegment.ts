export function squaredDistanceToLineSegment(
    x: number, y: number,
    x1: number, y1: number,
    x2: number, y2: number
): number
{
    const a = x - x1;
    const b = y - y1;
    const c = x2 - x1;
    const d = y2 - y1;

    const dot = (a * c) + (b * d);
    const lenSq = (c * c) + (d * d);
    let param = -1;

    if (lenSq !== 0)
    {
        param = dot / lenSq;
    }

    let xx; let
        yy;

    if (param < 0)
    {
        xx = x1;
        yy = y1;
    }
    else if (param > 1)
    {
        xx = x2;
        yy = y2;
    }

    else
    {
        xx = x1 + (param * c);
        yy = y1 + (param * d);
    }

    const dx = x - xx;
    const dy = y - yy;

    return (dx * dx) + (dy * dy);
}
