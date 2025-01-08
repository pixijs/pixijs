import { deprecation } from '../../../utils/logging/deprecation';

import type { Container } from '../Container';
import type { Bounds } from './Bounds';

/**
 * Does exactly the same as getGlobalBounds, but does instead makes use of transforming AABBs
 * of the various children within the scene graph. This is much faster, but less accurate.
 *
 * Deprecated, use container.getFastGlobalBounds() instead.
 *
 * the result will never be smaller - only ever slightly larger (in most cases, it will be the same).
 * @param target - The target container to get the bounds from
 * @param bounds - The output bounds object.
 * @returns The bounds.
 * @deprecated since 8.7.0
 * @see container.getFastGlobalBounds
 */
export function getFastGlobalBounds(target: Container, bounds: Bounds): Bounds
{
    // #if _DEBUG
    deprecation('8.7.0', 'Use container.getFastGlobalBounds() instead');
    // #endif

    return target.getFastGlobalBounds(true, bounds);
}
