import { BatchTextureArray } from '../shared/BatchTextureArray';
import { TextureSource } from '~/rendering';

function add(batch: BatchTextureArray, source: TextureSource): void
{
    batch.ids[source.uid] = batch.count;
    batch.textures[batch.count++] = source;
}

describe('BatchTextureArray', () =>
{
    it('should forget the locations of its textures when cleared', () =>
    {
        const batch = new BatchTextureArray();

        add(batch, new TextureSource());
        add(batch, new TextureSource());

        batch.clear();

        expect(Object.keys(batch.ids)).toHaveLength(0);
        expect(batch.count).toBe(0);
        expect(batch.textures).toEqual([null, null]);
    });

    it('should only hold the locations of the textures it holds after being reused', () =>
    {
        const batch = new BatchTextureArray();
        let source: TextureSource;

        for (let i = 0; i < 100; i++)
        {
            batch.clear();
            source = new TextureSource();
            add(batch, source);
        }

        expect(Object.keys(batch.ids)).toEqual([String(source.uid)]);
        expect(batch.ids[source.uid]).toBe(0);
    });
});
