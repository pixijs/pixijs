export function buildArc(
    points: number[],
    x: number, y: number,
    radius: number,
    start: number,
    end: number,
    clockwise: boolean,
    steps?: number
)
{
    // determine distance between the two angles
    // ...probably a nicer way of writing this
    let dist = Math.abs(start - end);

    if (!clockwise && start > end)
    {
        dist = (2 * Math.PI) - dist;
    }
    else if (clockwise && end > start)
    {
        dist = (2 * Math.PI) - dist;
    }

    // approximate the # of steps using the cube root of the radius

    steps ||= Math.max(6, Math.floor(6 * Math.pow(radius, 1 / 3) * (dist / (Math.PI))));

    // ensure we have at least 3 steps..
    steps = Math.max(steps, 3);

    let f = dist / (steps);
    let t = start;

    // modify direction
    f *= clockwise ? -1 : 1;

    for (let i = 0; i < steps + 1; i++)
    {
        const cs = Math.cos(t);
        const sn = Math.sin(t);

        const nx = x + (cs * radius);
        const ny = y + (sn * radius);

        points.push(nx, ny);

        t += f;
    }
}
