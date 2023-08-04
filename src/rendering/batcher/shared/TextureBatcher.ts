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
    public textures: TextureSource[] = [];
    public bindGroup: BindGroup;
    public size = 0;
    public batchLocations: Record<number, number> = Object.create(null);
}

export class TextureBatcher
{
    private _textureTicks: Record<number, number> = Object.create(null);
    private _tick = 1000;
    private _output: TextureBatch;
    private _bindingOffset: number;

    public begin()
    {
        batchPoolIndex = 0;

        this._bindingOffset = 0;
        this.reset();
    }

    public reset()
    {
        this._tick++;

        this._output = batchPool[batchPoolIndex++] || new TextureBatchOutput();

        this._output.size = 0;
    }

    public finish(previousBatch?: TextureBatch)
    {
        // TODO make sure to add empty textures to the batch.

        let output = this._output;

        // TODO this should never have length 0.. need to investigate..
        if (previousBatch && previousBatch.textures.length && output.textures.length)
        {
            output = optimizeBindings(previousBatch, output, this._tick, this._bindingOffset++);
        }

        this.reset();

        return output;
    }

    public add(texture: BindableTexture): boolean
    {
        const tick = this._tick;
        const textureTicks = this._textureTicks;

        if (textureTicks[texture.styleSourceKey] === tick) return true;

        const styleSourceKey = texture.styleSourceKey;
        const output = this._output;

        if (output.size === MAX_TEXTURES) return false;

        output.textures[output.size] = texture;

        textureTicks[styleSourceKey] = tick;

        output.batchLocations[styleSourceKey] = output.size++;

        batchPoolIndex = 0;

        return true;
    }

    public destroy()
    {
        this._output = null;
        this._textureTicks = null;
    }
}
