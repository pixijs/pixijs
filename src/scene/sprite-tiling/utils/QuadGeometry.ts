import { MeshGeometry } from '../../mesh/shared/MeshGeometry';

const typeSymbol = Symbol.for('QuadGeometry');

/** @internal */
export class QuadGeometry extends MeshGeometry
{
    /**
     * Type symbol used to identify instances of QuadGeometry.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a QuadGeometry.
     * @param obj - The object to check.
     * @returns True if the object is a QuadGeometry, false otherwise.
     */
    public static isQuadGeometry(obj: any): obj is QuadGeometry
    {
        return !!obj && !!obj[typeSymbol];
    }

    constructor()
    {
        super({
            positions: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
        });
    }
}
