import { uid } from '../../../utils/data/uid';
import { ViewableBuffer } from '../../../utils/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { Batch } from './Batcher';
import { BatchTextureArray } from './BatchTextureArray';
import { MAX_TEXTURES } from './const';

import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { BLEND_MODES } from '../../renderers/shared/state/const';
import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { BatchableObject, BatchAction, Batcher } from './Batcher';

class BatchData
{
    public batchTick = -1;
    public batchLocation = -1;
}

let BATCH_TICK = 0;
const textureHashy = Object.create(null);

export class BatcherStyleSource
{
    public readonly uid = uid('batcherStyleSource');
    public attributeBuffer: ViewableBuffer;
    public indexBuffer: Uint32Array;

    public attributeSize: number;
    public indexSize: number;
    public elementSize: number;
    public elementStart: number;

    public dirty = true;

    public batchIndex = 0;
    public batches: Batch[] = [];

    // specifics.
    private readonly _vertexSize: number = 6;

    private _elements: BatchableObject[] = [];

    private readonly _batchPool: Batch[] = [];
    private _batchPoolIndex = 0;
    private readonly _textureBatchPool: BatchTextureArray[] = [];
    private _textureBatchPoolIndex = 0;
    private _batchIndexStart: number;
    private _batchIndexSize: number;

    constructor(vertexSize = 4, indexSize = 6)
    {
        this.attributeBuffer = new ViewableBuffer(vertexSize * this._vertexSize * 4);

        this.indexBuffer = new Uint32Array(indexSize);
    }

    public begin()
    {
        this.batchIndex = 0;
        this.elementSize = 0;
        this.elementStart = 0;
        this.indexSize = 0;
        this.attributeSize = 0;
        this._batchPoolIndex = 0;
        this._textureBatchPoolIndex = 0;
        this._batchIndexStart = 0;
        this._batchIndexSize = 0;

        this.dirty = true;
    }

    public add(batchableObject: BatchableObject)
    {
        this._elements[this.elementSize++] = batchableObject;

        batchableObject.indexStart = this.indexSize;
        batchableObject.location = this.attributeSize;
        batchableObject.batcher = this as any as Batcher
        ;

        this.indexSize += batchableObject.indexSize;
        this.attributeSize += ((batchableObject.vertexSize) * this._vertexSize);
    }

    public checkAndUpdateTexture(batchableObject: BatchableObject, texture: Texture): boolean
    {
        const textureId = batchableObject.batch.textures.ids[texture._source._textureBindLocation];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (textureId === undefined) return false;

        batchableObject.textureId = textureId;
        batchableObject.texture = texture;

        return true;
    }

    public updateElement(batchableObject: BatchableObject)
    {
        this.dirty = true;

        batchableObject.packAttributes(
            this.attributeBuffer.float32View,
            this.attributeBuffer.uint32View,
            batchableObject.location, batchableObject.textureId);
    }

    /**
     * breaks the batcher. This happens when a batch gets too big,
     * or we need to switch to a different type of rendering (a filter for example)
     * @param instructionSet
     */
    public break(instructionSet: InstructionSet)
    {
        const elements = this._elements;

        let textureBatch = this._textureBatchPool[this._textureBatchPoolIndex++] || new BatchTextureArray();

        textureBatch.clear();

        // length 0??!! (we broke without ading anything)
        if (!elements[this.elementStart]) return;

        let blendMode = elements[this.elementStart].blendMode;

        if (this.attributeSize * 4 > this.attributeBuffer.size)
        {
            this._resizeAttributeBuffer(this.attributeSize * 4);
        }

        if (this.indexSize > this.indexBuffer.length)
        {
            this._resizeIndexBuffer(this.indexSize);
        }

        const f32 = this.attributeBuffer.float32View;
        const u32 = this.attributeBuffer.uint32View;
        const iBuffer = this.indexBuffer;

        let size = this._batchIndexSize;
        let start = this._batchIndexStart;

        let action: BatchAction = 'startBatch';
        let batch = this._batchPool[this._batchPoolIndex++] || new Batch();

        // write the data...
        for (let i = this.elementStart; i < this.elementSize; ++i)
        {
            const element = elements[i];

            elements[i] = null;

            const texture = element.texture;
            const styleSourceKey = texture.styleSourceKey;

            const textureBatchData = textureHashy[styleSourceKey] || new BatchData();

            if (textureBatchData.batchTick === BATCH_TICK)
            {
                element.textureId = textureBatchData.batchLocation;

                size += element.indexSize;
                element.packAttributes(f32, u32, element.location, element.textureId);
                element.packIndex(iBuffer, element.indexStart, element.location / this._vertexSize);

                element.batch = batch;

                continue;
            }

            textureBatchData.batchTick = BATCH_TICK;

            if (textureBatch.count >= MAX_TEXTURES || blendMode !== element.blendMode)
            {
                this._finishBatch(
                    batch,
                    start,
                    size - start,
                    textureBatch,
                    blendMode,
                    instructionSet,
                    action
                );

                action = 'renderBatch';
                start = size;

                // create a batch...
                blendMode = element.blendMode;

                textureBatch = this._textureBatchPool[this._textureBatchPoolIndex++] || new BatchTextureArray();
                textureBatch.clear();

                batch = this._batchPool[this._batchPoolIndex++] || new Batch();
                ++BATCH_TICK;
            }

            textureBatchData.batchLocation = element.textureId = textureBatch.count;

            textureBatch.ids[styleSourceKey] = textureBatch.count;
            textureBatch.textures[textureBatch.count++] = texture as any as TextureSource;
            element.batch = batch;

            size += element.indexSize;
            element.packAttributes(f32, u32, element.location, element.textureId);
            element.packIndex(iBuffer, element.indexStart, element.location / this._vertexSize);
        }

        if (textureBatch.count > 0)
        {
            this._finishBatch(
                batch,
                start,
                size - start,
                textureBatch,
                blendMode,
                instructionSet,
                action
            );

            start = size;
            ++BATCH_TICK;
        }

        this.elementStart = this.elementSize;
        this._batchIndexStart = start;
        this._batchIndexSize = size;
    }

    private _finishBatch(
        batch: Batch,
        indexStart: number,
        indexSize: number,
        textureBatch: BatchTextureArray,
        blendMode: BLEND_MODES,
        instructionSet: InstructionSet,
        action: BatchAction
    )
    {
        batch.gpuBindGroup = null;
        batch.action = action;

        batch.batcher = this as any as Batcher;
        batch.textures = textureBatch;
        batch.blendMode = blendMode;

        batch.start = indexStart;
        batch.size = indexSize;

        ++BATCH_TICK;

        instructionSet.add(batch);
    }

    public finish(instructionSet: InstructionSet)
    {
        this.break(instructionSet);
    }

    public ensureAttributeBuffer(size: number)
    {
        if (size * 4 < this.attributeBuffer.size) return;

        this._resizeAttributeBuffer(size * 4);
    }

    public ensureIndexBuffer(size: number)
    {
        if (size < this.indexBuffer.length) return;

        this._resizeIndexBuffer(size);
    }

    private _resizeAttributeBuffer(size: number)
    {
        const newSize = Math.max(size, this.attributeBuffer.size * 2);

        const newArrayBuffer = new ViewableBuffer(newSize);

        fastCopy(this.attributeBuffer.rawBinaryData, newArrayBuffer.rawBinaryData);

        this.attributeBuffer = newArrayBuffer;
    }

    private _resizeIndexBuffer(size: number)
    {
        const indexBuffer = this.indexBuffer;

        const newSize = Math.max(size, indexBuffer.length * 2);

        const newIndexBuffer = new Uint32Array(newSize);

        fastCopy(indexBuffer.buffer, newIndexBuffer.buffer);

        this.indexBuffer = newIndexBuffer;
    }

    public destroy()
    {
        for (let i = 0; i < this.batches.length; i++)
        {
            this.batches[i].destroy();
        }

        this.batches = null;

        for (let i = 0; i < this._elements.length; i++)
        {
            this._elements[i].batch = null;
        }

        this._elements = null;

        this.indexBuffer = null;

        this.attributeBuffer.destroy();
        this.attributeBuffer = null;
    }
}

