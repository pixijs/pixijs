import type { Point } from '../../maths/point/Point';
import type { PointData } from '../../maths/point/PointData';
import type { Bounds } from './bounds/Bounds';
import type { Container } from './Container';

/**
 * An effect that can be applied to a container. This is used to create effects such as filters/masks etc.
 * @memberof rendering
 */
export interface Effect
{
    pipe: string
    priority: number
    addBounds?(bounds: Bounds, skipUpdateTransform?: boolean): void
    addLocalBounds?(bounds: Bounds, localRoot: Container): void
    containsPoint?(point: PointData, hitTestFn: (container: Container, point: Point) => boolean): boolean
    destroy(): void
}

export interface EffectConstructor
{
    new(options?: any): Effect
    test?(options: any): boolean
}
