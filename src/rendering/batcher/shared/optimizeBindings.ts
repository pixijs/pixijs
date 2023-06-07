import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';
import type { TextureBatch } from './Batcher';

export const missing: TextureSource[] = [];
export let missingCount = 0;

export const currentCopy: TextureSource[] = [];
export let currentCount = 0;

export const usedSlots: Record<number, number> = {};

/**
 * This function will take the previous texture batch and the current texture batch and
 * will optimize the current texture batch by reusing already bound textures that are already bound
 *
 * essentially, this should result in lest texture binds in the renderer.
 *
 * and will return the optimized texture batch.
 * @param previousTextureBatch - the previous texture batch to compare to
 * @param currentTextureBatch - the current texture batch modify and optimize
 * @param tick - this batchers tick, used to check if textures were used in the previous batch
 * @param bindingOffset - an offset to the next binding location
 * @returns the optimized texture batch (same as currentTextureBatch)
 */
export function optimizeBindings(
    previousTextureBatch: TextureBatch,
    currentTextureBatch: TextureBatch,
    tick: number,
    bindingOffset: number
): TextureBatch
{
    missingCount = 0;
    currentCount = 0;

    const boundTextureSize = 16;

    const prev = previousTextureBatch.textures;
    const next = currentTextureBatch.textures;
    const curr = currentCopy;

    for (let i = 0; i < next.length; i++)
    {
        curr[i] = next[i] as TextureSource;
        currentCount++;
    }

    // copy prev to next..
    for (let i = 0; i < prev.length; i++)
    {
        next[i] = prev[i];
    }

    const batchLocations = currentTextureBatch.batchLocations;
    // TODO use style source key

    for (let i = 0; i < currentCount; i++)
    {
        const boundTexture = curr[i];

        let found = false;

        // find textures that are already bound..
        for (let j = 0; j < prev.length; j++)
        {
            if (boundTexture === prev[j])
            {
                found = true;
                usedSlots[i] = tick;
                batchLocations[boundTexture.styleSourceKey] = j;

                break;
            }
        }

        if (!found)
        {
            missing[missingCount++] = curr[i];
        }
    }

    for (let i = 0; i < missingCount; i++)
    {
        const missingTexture = missing[i];

        for (let j = 0; j < boundTextureSize; j++)
        {
            const modJ = (j + bindingOffset) % 16;

            if (usedSlots[modJ] !== tick)
            {
                next[modJ] = missingTexture;
                usedSlots[modJ] = tick;

                batchLocations[missingTexture.styleSourceKey] = modJ;

                break;
            }
        }
    }

    return currentTextureBatch;
}
