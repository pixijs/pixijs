import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';

/**
 * Used by the batcher to build texture batches. Holds list of textures and their respective locations.
 * @memberof rendering
 */
export class BatchTextureArray
{
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
