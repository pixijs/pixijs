import type { Point } from '../../maths/point/Point';
import type { PointData } from '../../maths/point/PointData';
import type { Bounds } from './bounds/Bounds';
import type { Container } from './Container';

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
