export function getOrientationOfPoints(points: number[]): number
{
    const m = points.length;

    if (m < 6)
    {
        return 1;
    }

    let area = 0;

    for (let i = 0, x1 = points[m - 2], y1 = points[m - 1]; i < m; i += 2)
    {
        const x2 = points[i];
        const y2 = points[i + 1];

        area += (x2 - x1) * (y2 + y1);

        x1 = x2;
        y1 = y2;
    }

    if (area < 0)
    {
        return -1;
    }

    return 1;
}
