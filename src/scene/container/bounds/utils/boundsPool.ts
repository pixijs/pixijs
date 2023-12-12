import { Bounds } from '../Bounds';

const boundsPool: Bounds[] = [];
let boundsPoolIndex = 0;

export function getBounds(): Bounds
{
    boundsPoolIndex--;

    if (boundsPoolIndex < 0)
    {
        boundsPoolIndex = 0;

        return new Bounds();
    }

    return boundsPool[boundsPoolIndex];
}

export function returnBounds(bounds: Bounds)
{
    boundsPool[boundsPoolIndex++] = bounds;
}
