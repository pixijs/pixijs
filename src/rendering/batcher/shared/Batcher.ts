import { uid } from '../../../utils/data/uid';
import { ViewableBuffer } from '../../../utils/data/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { type BLEND_MODES } from '../../renderers/shared/state/const';
import { getAdjustedBlendModeBlend } from '../../renderers/shared/state/getAdjustedBlendModeBlend';
import { getMaxTexturesPerBatch } from '../gl/utils/maxRecommendedTextures';
import { BatchTextureArray } from './BatchTextureArray';

import type { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import type { IndexBufferArray } from '../../renderers/shared/geometry/Geometry';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { Texture } from '../../renderers/shared/texture/Texture';

export type BatchAction = 'startBatch' | 'renderBatch';

/**
 * A batch pool is used to store batches when they are not currently in use.
 * @memberof rendering
 */
export class Batch implements Instruction
{
    public renderPipeId = 'batch';
    public action: BatchAction = 'startBatch';

    // TODO - eventually this could be useful for flagging batches as dirty and then only rebuilding those ones
    // public elementStart = 0;
    // public elementSize = 0;

    // for drawing..
    public start = 0;
    public size = 0;
    public textures: BatchTextureArray;

    public blendMode: BLEND_MODES = 'normal';

    public canBundle = true;

    /**
     * breaking rules slightly here in the name of performance..
     * storing references to these bindgroups here is just faster for access!
     * keeps a reference to the GPU bind group to set when rendering this batch for WebGPU. Will be null is using WebGL.
     */
    public gpuBindGroup: GPUBindGroup;
    /**
     * breaking rules slightly here in the name of performance..
     * storing references to these bindgroups here is just faster for access!
     * keeps a reference to the bind group to set when rendering this batch for WebGPU. Will be null if using WebGl.
     */
    public bindGroup: BindGroup;

    public batcher: Batcher;

    public destroy()
    {
        this.textures = null;
        this.gpuBindGroup = null;
        this.bindGroup = null;
        this.batcher = null;
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
    packIndex: (indexBuffer: IndexBufferArray, index: number, indicesOffset: number) => void;

    texture: Texture;
    blendMode: BLEND_MODES;
    vertexSize: number;
    indexSize: number;

    // stored for efficient updating..
    textureId: number;
    location: number; // location in the buffer
    batcher: Batcher;
    batch: Batch;

    roundPixels: 0 | 1;
}

let BATCH_TICK = 0;

/**
 * The options for the batcher.
 * @ignore
 */
export interface BatcherOptions
{
    /** The size of the vertex buffer. */
    vertexSize?: number;
    /** The size of the index buffer. */
    indexSize?: number;
}

/**
 * A batcher is used to batch together objects with the same texture.
 * @ignore
 */
export class Batcher
{
    public static defaultOptions: BatcherOptions = {
        vertexSize: 4,
        indexSize: 6,
    };

    public uid = uid('batcher');
    public attributeBuffer: ViewableBuffer;
    public indexBuffer: IndexBufferArray;

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
    private readonly _maxTextures: number;

    constructor(options: BatcherOptions = {})
    {
        options = { ...Batcher.defaultOptions, ...options };

        const { vertexSize, indexSize } = options;

        this.attributeBuffer = new ViewableBuffer(vertexSize * this._vertexSize * 4);

        this.indexBuffer = new Uint16Array(indexSize);

        this._maxTextures = getMaxTexturesPerBatch();
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
        batchableObject.batcher = this;

        this.indexSize += batchableObject.indexSize;
        this.attributeSize += ((batchableObject.vertexSize) * this._vertexSize);
    }

    public checkAndUpdateTexture(batchableObject: BatchableObject, texture: Texture): boolean
    {
        const textureId = batchableObject.batch.textures.ids[texture._source.uid];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (!textureId && textureId !== 0) return false;

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
        // ++BATCH_TICK;
        const elements = this._elements;

        let textureBatch = this._textureBatchPool[this._textureBatchPoolIndex++] || new BatchTextureArray();

        textureBatch.clear();

        // length 0??!! (we broke without ading anything)
        if (!elements[this.elementStart]) return;

        const firstElement = elements[this.elementStart];
        let blendMode = getAdjustedBlendModeBlend(firstElement.blendMode, firstElement.texture._source);

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

        const maxTextures = this._maxTextures;

        for (let i = this.elementStart; i < this.elementSize; ++i)
        {
            const element = elements[i];

            elements[i] = null;

            const texture = element.texture;
            const source = texture._source;

            const adjustedBlendMode = getAdjustedBlendModeBlend(element.blendMode, source);

            const blendModeChange = blendMode !== adjustedBlendMode;

            if (source._batchTick === BATCH_TICK && !blendModeChange)
            {
                element.textureId = source._textureBindLocation;

                size += element.indexSize;
                element.packAttributes(f32, u32, element.location, element.textureId);
                element.packIndex(iBuffer, element.indexStart, element.location / this._vertexSize);

                element.batch = batch;

                continue;
            }

            source._batchTick = BATCH_TICK;

            if (textureBatch.count >= maxTextures || blendModeChange)
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
                blendMode = adjustedBlendMode;

                textureBatch = this._textureBatchPool[this._textureBatchPoolIndex++] || new BatchTextureArray();
                textureBatch.clear();

                batch = this._batchPool[this._batchPoolIndex++] || new Batch();
                ++BATCH_TICK;
            }

            element.textureId = source._textureBindLocation = textureBatch.count;
            textureBatch.ids[source.uid] = textureBatch.count;
            textureBatch.textures[textureBatch.count++] = source;
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

        batch.batcher = this;
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

    /**
     * Resizes the attribute buffer to the given size (1 = 1 float32)
     * @param size - the size in vertices to ensure (not bytes!)
     */
    public ensureAttributeBuffer(size: number)
    {
        if (size * 4 <= this.attributeBuffer.size) return;

        this._resizeAttributeBuffer(size * 4);
    }

    /**
     * Resizes the index buffer to the given size (1 = 1 float32)
     * @param size - the size in vertices to ensure (not bytes!)
     */
    public ensureIndexBuffer(size: number)
    {
        if (size <= this.indexBuffer.length) return;

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

        let newSize = Math.max(size, indexBuffer.length * 1.5);

        newSize += newSize % 2;

        // this, is technically not 100% accurate, as really we should
        // be checking the maximum value in the buffer. This approximation
        // does the trick though...

        // make sure buffer is always an even number..
        const newIndexBuffer = (newSize > 65535) ? new Uint32Array(newSize) : new Uint16Array(newSize);

        if (newIndexBuffer.BYTES_PER_ELEMENT !== indexBuffer.BYTES_PER_ELEMENT)
        {
            for (let i = 0; i < indexBuffer.length; i++)
            {
                newIndexBuffer[i] = indexBuffer[i];
            }
        }
        else
        {
            fastCopy(indexBuffer.buffer, newIndexBuffer.buffer);
        }

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

