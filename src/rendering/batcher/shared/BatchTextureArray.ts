import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

const typeSymbol = Symbol.for('pixijs.BatchTextureArray');

/**
 * Used by the batcher to build texture batches. Holds list of textures and their respective locations.
 * @category rendering
 * @advanced
 */
export class BatchTextureArray
{
    /**
     * Type symbol used to identify instances of BatchTextureArray.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a BatchTextureArray.
     * @param obj - The object to check.
     * @returns True if the object is a BatchTextureArray, false otherwise.
     */
    public static isBatchTextureArray(obj: any): obj is BatchTextureArray
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** Inside textures array. */
    public textures: TextureSource[];

    /** Respective locations for textures. */
    public ids: Record<number, number> = Object.create(null);

    /** Number of filled elements. */
    public count: number;

    constructor()
    {
        this.textures = [];
        this.count = 0;
    }

    /** Clear the textures and their locations. */
    public clear(): void
    {
        for (let i = 0; i < this.count; i++)
        {
            const t = this.textures[i];

            this.textures[i] = null;
            this.ids[t.uid] = null;
        }

        this.count = 0;
    }
}
