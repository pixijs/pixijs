import type { PointData } from '../../maths/PointData';
import type { Bounds } from './bounds/Bounds';
import type { Container } from './Container';

export interface Effect
{
    pipe: string
    priority: number
    addBounds?(bounds: Bounds, skipUpdateTransform?: boolean): void
    addLocalBounds?(bounds: Bounds, localRoot: Container): void
    containsPoint?(point: PointData): boolean
    destroy(): void
}

export interface EffectConstructor
{
    new(options?: any): Effect
    test?(options: any): boolean
}
