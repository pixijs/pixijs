import { MAX_TEXTURES } from './const';
import { optimizeBindings } from './optimizeBindings';

import type { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';
import type { BindableTexture } from '../../renderers/shared/texture/Texture';
import type { TextureBatch } from './Batcher';

const batchPool: TextureBatchOutput[] = [];
let batchPoolIndex = 0;

export class TextureBatchOutput implements TextureBatch
{
    textures: TextureSource[] = [];
    bindGroup: BindGroup;
    size = 0;
    batchLocations: Record<number, number> = {};
}

export class TextureBatcher
{
    textureTicks: Record<number, number> = {};

    tick = 1000;

    output: TextureBatch;
    bindingOffset: number;

    begin()
    {
        batchPoolIndex = 0;

        this.bindingOffset = 0;
        this.reset();
    }

    reset()
    {
        this.tick++;

        this.output = batchPool[batchPoolIndex++] || new TextureBatchOutput();

        this.output.size = 0;
    }

    finish(previousBatch?: TextureBatch)
    {
        // TODO make sure to add empty textures to the batch.

        let output = this.output;

        // TODO this should never have length 0.. need to investigate..
        if (previousBatch && previousBatch.textures.length && output.textures.length)
        {
            output = optimizeBindings(previousBatch, output, this.tick, this.bindingOffset++);
        }

        this.reset();

        return output;
    }

    add(texture: BindableTexture): boolean
    {
        const tick = this.tick;
        const textureTicks = this.textureTicks;

        if (textureTicks[texture.styleSourceKey] === tick) return true;

        const styleSourceKey = texture.styleSourceKey;
        const output = this.output;

        if (output.size === MAX_TEXTURES) return false;

        output.textures[output.size] = texture;

        textureTicks[styleSourceKey] = tick;

        output.batchLocations[styleSourceKey] = output.size++;

        batchPoolIndex = 0;

        return true;
    }
}
