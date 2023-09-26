import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getGlobalBounds } from '../../../scene/container/bounds/getGlobalBounds';

import type { Container } from '../../../scene/container/Container';

const tempBounds = new Bounds();

export function addMaskBounds(mask: Container, bounds: Bounds, skipUpdateTransform: boolean): void
{
    const boundsToMask = tempBounds;

    mask.measurable = true;

    getGlobalBounds(mask, skipUpdateTransform, boundsToMask);

    bounds.addBoundsMask(boundsToMask);

    mask.measurable = false;
}

