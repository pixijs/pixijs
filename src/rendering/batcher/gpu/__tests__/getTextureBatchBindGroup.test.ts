import { TextureSource } from '../../../renderers/shared/texture/sources/TextureSource';
import { getTextureBatchBindGroup } from '../getTextureBatchBindGroup';

import type { BindGroup } from '../../../renderers/gpu/shader/BindGroup';

const collisionA = [18012, 36172];
const collisionB = [42335, 9977];

function hashTextureIds(ids: number[]): number
{
    return ids.reduce((hash, id) => Math.imul(hash ^ id, 16777619) >>> 0, 2166136261);
}

function createSources(ids: number[]): TextureSource[]
{
    return ids.map((id) =>
    {
        const source = new TextureSource({ width: 1, height: 1 });

        Object.defineProperty(source, 'uid', { value: id });

        return source;
    });
}

function expectResources(group: BindGroup, sources: TextureSource[]): void
{
    for (let i = 0; i < sources.length; i++)
    {
        expect(group.resources[i * 2]).toBe(sources[i].source);
        expect(group.resources[(i * 2) + 1]).toBe(sources[i].style);
    }
}

describe('getTextureBatchBindGroup', () =>
{
    it('does not reuse a bind group for colliding texture-source lists', () =>
    {
        expect(hashTextureIds(collisionA)).toBe(hashTextureIds(collisionB));

        const sourcesA = createSources(collisionA);
        const sourcesB = createSources(collisionB);
        const [firstSourceA] = sourcesA;

        try
        {
            const groupA = getTextureBatchBindGroup(sourcesA, 2, 2);

            expect(groupA).toBeDefined();
            expectResources(groupA, sourcesA);

            firstSourceA.destroy();

            const groupB = getTextureBatchBindGroup(sourcesB, 2, 2);

            expect(groupB).not.toBe(groupA);
            expectResources(groupB, sourcesB);
            expect(getTextureBatchBindGroup(sourcesB, 2, 2)).toBe(groupB);
        }
        finally
        {
            for (const source of [...sourcesA, ...sourcesB])
            {
                if (!source.destroyed) source.destroy();
            }
        }
    });
});
