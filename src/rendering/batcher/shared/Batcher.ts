import { ViewableBuffer } from '../../../utils/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { TextureBatcher } from './TextureBatcher';

import type { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { BLEND_MODES } from '../../renderers/shared/state/const';
import type { TextureSource } from '../../renderers/shared/texture/sources/TextureSource';
import type { BindableTexture, Texture } from '../../renderers/shared/texture/Texture';

// TODO OPTIMISE THIS CODE

export interface TextureBatch
{
    textures: BindableTexture[]
    bindGroup: BindGroup;
    batchLocations: Record<number, number>
    size: number;
}

export class Batch
{
    type = 'batch';
    action = 'renderer';

    elementStart = 0;
    elementSize = 0;

    // for drawing..
    start = 0;
    size = 0;
    textures: TextureBatch;
    blendMode: BLEND_MODES;

    canBundle = true;
    batchParent: { geometry: Geometry, batcher: Batcher };
}

export interface BatchableObject
{
    indexStart: number;
    packAttributes: (
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number,
    ) => void;
    packIndex: (indexBuffer: Uint32Array, index: number, indicesOffset: number) => void;

    texture: Texture;
    blendMode: BLEND_MODES;
    vertexSize: number;
    indexSize: number;

    // stored for efficient updating..
    textureId: number;
    location: number; // location in the buffer
    batcher: Batcher;
    batch: Batch;
}

export class Batcher
{
    maxSize = 4096 * 20;

    attributeBuffer: ViewableBuffer;
    indexBuffer: Uint32Array;

    attributeSize: number;
    indexSize: number;
    elementSize: number;

    dirty = true;

    batchIndex = 0;
    batches: Batch[] = [];

    // specifics.
    vertexSize = 6;

    textureBatcher = new TextureBatcher();
    computeBuffer: ViewableBuffer;
    elements: BatchableObject[] = [];
    updateIndex: boolean;
    currentBlendMode: number;
    boundTextures: TextureSource[];

    constructor(vertexSize = 4, indexSize = 6)
    {
        this.attributeBuffer = new ViewableBuffer(vertexSize * this.vertexSize * 4);

        this.indexBuffer = new Uint32Array(indexSize);
    }

    begin()
    {
        this.batchIndex = 0;
        this.currentBlendMode = -1;

        let currentBatch = this.batches[this.batchIndex];

        if (!currentBatch)
        {
            currentBatch = this.batches[this.batchIndex] = new Batch();
        }

        currentBatch.elementSize = 0;
        currentBatch.start = 0;
        currentBatch.size = 0;

        this.attributeSize = 0;
        this.indexSize = 0;
        this.elementSize = 0;

        this.textureBatcher.begin();

        this.dirty = true;
    }

    add(batchableObject: BatchableObject)
    {
        let batch = this.batches[this.batchIndex];

        const texture = batchableObject.texture;

        const blendMode = batchableObject.blendMode;

        if (this.currentBlendMode !== blendMode
            || batch.elementSize >= this.maxSize
            || !this.textureBatcher.add(texture))
        //  || newSize < 65535)
        {
            this.break(false);

            this.currentBlendMode = blendMode;
            batch = this.batches[this.batchIndex];
            batch.blendMode = blendMode;

            this.textureBatcher.add(texture);
        }

        batch.elementSize++;

        batchableObject.batcher = this;
        batchableObject.batch = batch;

        batchableObject.location = this.attributeSize;
        batchableObject.indexStart = this.indexSize;

        this.indexSize += batchableObject.indexSize;
        this.attributeSize += ((batchableObject.vertexSize) * this.vertexSize);

        // could pack it right here??

        this.elements[this.elementSize++] = batchableObject;
    }

    checkAndUpdateTexture(batchableObject: BatchableObject, texture: Texture): boolean
    {
        const textureId = batchableObject.batch.textures.batchLocations[texture.styleSourceKey];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (textureId === undefined) return false;

        batchableObject.textureId = textureId;
        batchableObject.texture = texture;

        return true;
    }

    updateElement(batchableObject: BatchableObject)// , visible: boolean)
    {
        this.dirty = true;

        batchableObject.packAttributes(
            this.attributeBuffer.float32View,
            this.attributeBuffer.uint32View,
            batchableObject.location, batchableObject.textureId);

        // TODO as the element owns the function.. do we need to pass in  the id and
    }

    hideElement(element: BatchableObject)
    {
        this.dirty = true;

        // only hide once!
        const buffer = this.attributeBuffer.float32View;
        let location = element.location;

        for (let i = 0; i < element.vertexSize; i++)
        {
            buffer[location] = 0;
            buffer[location + 1] = 0;

            location += 6;
        }
    }

    /**
     * breaks the batcher. This happens when a batch gets too big,
     * or we need to switch to a different type of rendering (a filter for example)
     * @param hardBreak - this breaks all the batch data and stops it from trying to optimise the textures
     */
    break(hardBreak: boolean)
    {
        // TODO REMOVE THIS CHECK..
        if (this.elementSize === 0) return;

        let previousBatch;

        if (this.batchIndex > 0)
        {
            previousBatch = this.batches[this.batchIndex - 1];
        }

        if (this.attributeSize * 4 > this.attributeBuffer.size)
        {
            this._resizeAttributeBuffer(this.attributeSize * 4);
        }

        if (this.indexSize > this.indexBuffer.length)
        {
            this._resizeIndexBuffer(this.indexSize);
        }

        const currentBatch = this.batches[this.batchIndex];

        currentBatch.size = this.indexSize - currentBatch.start;

        if (!hardBreak && previousBatch)
        {
            currentBatch.textures = this.textureBatcher.finish(previousBatch.textures);
        }
        else
        {
            currentBatch.textures = this.textureBatcher.finish();
        }

        const size = this.elementSize - currentBatch.elementStart;

        for (let i = 0; i < size; i++)
        {
            const batchableObject = this.elements[currentBatch.elementStart + i];

            batchableObject.textureId = currentBatch.textures.batchLocations[batchableObject.texture.styleSourceKey];

            batchableObject.packAttributes(
                this.attributeBuffer.float32View,
                this.attributeBuffer.uint32View,
                batchableObject.location, batchableObject.textureId
            );

            batchableObject.packIndex(
                this.indexBuffer,
                batchableObject.indexStart,
                batchableObject.location / this.vertexSize,
            );
        }

        this.batchIndex++;

        let nextBatch = this.batches[this.batchIndex];

        if (!nextBatch)
        {
            nextBatch = this.batches[this.batchIndex] = new Batch();
        }

        nextBatch.blendMode = this.currentBlendMode;
        nextBatch.elementStart = this.elementSize;
        nextBatch.elementSize = 0;
        nextBatch.start = this.indexSize;
    }

    finish()
    {
        this.break(false);
        // TODO do we need this?
        if (this.elementSize === 0) return;

        const currentBatch = this.batches[this.batchIndex];

        currentBatch.size = this.indexSize - currentBatch.start;

        if (this.batchIndex > 0)
        {
            const previousBatch = this.batches[this.batchIndex - 1];

            currentBatch.textures = this.textureBatcher.finish(previousBatch.textures);

            return;
        }

        currentBatch.textures = this.textureBatcher.finish();
    }

    update()
    {
        // emmpty
    }

    ensureAttributeBuffer(size: number)
    {
        if (size * 4 < this.attributeBuffer.size) return;

        this._resizeAttributeBuffer(size * 4);
    }

    ensureIndexBuffer(size: number)
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
}
