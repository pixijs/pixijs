import type { ExtensionMetadataDetails } from '../../../../extensions/Extensions';
import type { ShapePrimitive } from '../../../../maths/shapes/ShapePrimitive';

/** @internal */
export interface ShapeBuildCommand<T extends ShapePrimitive = ShapePrimitive>
{
    extension: ExtensionMetadataDetails
    build(shape: T, points: number[]): boolean;
    triangulate(
        points: number[],
        vertices: number[],
        verticesStride: number,
        verticesOffset: number,
        indices: number[],
        indicesOffset: number
    ): void;
}
