import { ViewableBuffer } from '../../../utils/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { State } from '../../renderers/shared/state/State';
import { TextureBatcher } from './TextureBatcher';

import type { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import type { Geometry } from '../../renderers/shared/geometry/Geometry';
import type { BLEND_MODES } from '../../renderers/shared/state/const';
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
    public type = 'batch';
    public action = 'renderer';

    public elementStart = 0;
    public elementSize = 0;

    // for drawing..
    public start = 0;
    public size = 0;
    public textures: TextureBatch;
    public blendMode: BLEND_MODES;
    public state = State.for2d();

    public canBundle = true;
    public batchParent: { geometry: Geometry, batcher: Batcher };

    public destroy()
    {
        this.textures = null;
        this.batchParent = null;
    }
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
    private readonly _maxSize: number = 4096 * 20;

    public attributeBuffer: ViewableBuffer;
    public indexBuffer: Uint32Array;

    public attributeSize: number;
    public indexSize: number;
    public elementSize: number;

    public dirty = true;

    public batchIndex = 0;
    public batches: Batch[] = [];

    // specifics.
    private readonly _vertexSize: number = 6;

    private readonly _textureBatcher = new TextureBatcher();
    private _elements: BatchableObject[] = [];
    private _currentBlendMode: BLEND_MODES;

    constructor(vertexSize = 4, indexSize = 6)
    {
        this.attributeBuffer = new ViewableBuffer(vertexSize * this._vertexSize * 4);

        this.indexBuffer = new Uint32Array(indexSize);
    }

    public begin()
    {
        this.batchIndex = 0;
        this._currentBlendMode = 'inherit';

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

        this._textureBatcher.begin();

        this.dirty = true;
    }

    public add(batchableObject: BatchableObject)
    {
        let batch = this.batches[this.batchIndex];

        const texture = batchableObject.texture;

        const blendMode = batchableObject.blendMode;

        if (this._currentBlendMode !== blendMode
            || batch.elementSize >= this._maxSize
            || !this._textureBatcher.add(texture))
        //  || newSize < 65535)
        {
            this.break(false);

            this._currentBlendMode = blendMode;
            batch = this.batches[this.batchIndex];
            batch.state.blendMode = blendMode;

            this._textureBatcher.add(texture);
        }

        batch.elementSize++;

        batchableObject.batcher = this;
        batchableObject.batch = batch;

        batchableObject.location = this.attributeSize;
        batchableObject.indexStart = this.indexSize;

        this.indexSize += batchableObject.indexSize;
        this.attributeSize += ((batchableObject.vertexSize) * this._vertexSize);

        // could pack it right here??

        this._elements[this.elementSize++] = batchableObject;
    }

    public checkAndUpdateTexture(batchableObject: BatchableObject, texture: Texture): boolean
    {
        const textureId = batchableObject.batch.textures.batchLocations[texture.styleSourceKey];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (textureId === undefined) return false;

        batchableObject.textureId = textureId;
        batchableObject.texture = texture;

        return true;
    }

    public updateElement(batchableObject: BatchableObject)// , visible: boolean)
    {
        this.dirty = true;

        batchableObject.packAttributes(
            this.attributeBuffer.float32View,
            this.attributeBuffer.uint32View,
            batchableObject.location, batchableObject.textureId);

        // TODO as the element owns the function.. do we need to pass in  the id and
    }

    public hideElement(element: BatchableObject)
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
    public break(hardBreak: boolean)
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
            currentBatch.textures = this._textureBatcher.finish(previousBatch.textures);
        }
        else
        {
            currentBatch.textures = this._textureBatcher.finish();
        }

        this._packData(
            this.attributeBuffer.float32View,
            this.attributeBuffer.uint32View,
            this.indexBuffer,
            currentBatch.textures.batchLocations,
            currentBatch.elementStart,
            this.elementSize - currentBatch.elementStart,
            this._vertexSize,
            this._elements
        );

        this.batchIndex++;

        let nextBatch = this.batches[this.batchIndex];

        if (!nextBatch)
        {
            nextBatch = this.batches[this.batchIndex] = new Batch();
        }

        nextBatch.state.blendMode = this._currentBlendMode;
        nextBatch.elementStart = this.elementSize;
        nextBatch.elementSize = 0;
        nextBatch.start = this.indexSize;
    }

    public finish()
    {
        this.break(false);
        // TODO do we need this?
        if (this.elementSize === 0) return;

        const currentBatch = this.batches[this.batchIndex];

        currentBatch.size = this.indexSize - currentBatch.start;

        if (this.batchIndex > 0)
        {
            const previousBatch = this.batches[this.batchIndex - 1];

            currentBatch.textures = this._textureBatcher.finish(previousBatch.textures);

            return;
        }

        currentBatch.textures = this._textureBatcher.finish();
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

        this._textureBatcher.destroy();
    }

    private _packData(
        float32View: Float32Array,
        uint32View: Uint32Array,
        indexBuffer: Uint32Array,
        batchLocations: Record<number, number>,
        elementStart: number,
        size: number,
        vertexSize: number,
        elements: BatchableObject[],

    )
    {
        let batchableObject: BatchableObject = null;
        let textureId = 0;
        let location = 0;

        for (let i = 0; i < size; i++)
        {
            batchableObject = elements[elementStart + i];

            textureId = batchableObject.textureId = batchLocations[batchableObject.texture.styleSourceKey];
            location = batchableObject.location;

            batchableObject.packAttributes(
                float32View,
                uint32View,
                location,
                textureId
            );

            batchableObject.packIndex(
                indexBuffer,
                batchableObject.indexStart,
                location / vertexSize,
            );
        }
    }
}
