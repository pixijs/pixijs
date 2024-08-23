import { uid } from '../../../utils/data/uid';
import { ViewableBuffer } from '../../../utils/data/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { type BLEND_MODES } from '../../renderers/shared/state/const';
import { getAdjustedBlendModeBlend } from '../../renderers/shared/state/getAdjustedBlendModeBlend';
import { getMaxTexturesPerBatch } from '../gl/utils/maxRecommendedTextures';
import { BatchTextureArray } from './BatchTextureArray';
import { DefaultBatcher } from './DefaultBatcher';

import type { Matrix } from '../../../maths/matrix/Matrix';
import type { ViewContainer } from '../../../scene/view/View';
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
    public textures: BatchTextureArray = new BatchTextureArray();

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

// inlined pool for SPEEEEEEEEEED :D
const batchPool: Batch[] = [];
let batchPoolIndex = 0;

function getBatchFromPool()
{
    return batchPoolIndex > 0 ? batchPool[--batchPoolIndex] : new Batch();
}

function returnBatchToPool(batch: Batch)
{
    batchPool[batchPoolIndex++] = batch;
}

export interface BatchableElement
{
    // what batcher to use, must be registered.
    batcherName: string;

    color: number;

    texture: Texture;
    blendMode: BLEND_MODES;

    indexSize: number;

    attributeOffset: number;
    attributeSize: number;

    // used internally by batcher specific..
    location: number;
    indexStart: number;

    // stored for efficient updating..
    textureId: number;
    roundPixels: 0 | 1;
    attributeStart: number; // location in the buffer
    batcher: Batcher;
    batch: Batch;

    // sprite specific optimizations
    // packing a quad will give better perf!
    packAsQuad: boolean;

}

export interface BatchableQuadElement extends BatchableElement
{
    renderable: ViewContainer; // TODO only used with sprite batch..
}

export interface BatchableMeshElement extends BatchableElement
{
    groupTransform: Matrix;

    // buffer data..
    uvs: number[] | Float32Array;
    positions: number[] | Float32Array;
    indices: number[] | Uint16Array | Uint32Array;

    indexOffset: number;
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
    /** The maximum number of textures per batch. */
    maxTextures?: number;
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
        maxTextures: null,
    };

    /** unique id for this batcher */
    public readonly uid: number = uid('batcher');
    public attributeBuffer: ViewableBuffer;
    public indexBuffer: IndexBufferArray;

    public attributeSize: number;
    public attributeStart: number;
    public indexSize: number;
    public elementSize: number;
    public elementStart: number;

    public dirty = true;

    public activeBatcher = new DefaultBatcher();

    public batchIndex = 0;
    public batches: Batch[] = [];

    private _elements: BatchableElement[] = [];

    private _batchIndexStart: number;
    private _batchIndexSize: number;

    /** The maximum number of textures per batch. */
    public readonly maxTextures: number;

    constructor(options: BatcherOptions = {})
    {
        Batcher.defaultOptions.maxTextures = Batcher.defaultOptions.maxTextures ?? getMaxTexturesPerBatch();
        options = { ...Batcher.defaultOptions, ...options };

        const { vertexSize, indexSize, maxTextures } = options;

        this.attributeBuffer = new ViewableBuffer(vertexSize * 6 * 4);

        this.indexBuffer = new Uint16Array(indexSize);

        this.maxTextures = maxTextures;
    }

    public begin()
    {
        this.elementSize = 0;
        this.elementStart = 0;
        this.indexSize = 0;
        this.attributeSize = 0;
        this.attributeStart = 0;

        for (let i = 0; i < this.batchIndex; i++)
        {
            returnBatchToPool(this.batches[i]);
        }

        this.batchIndex = 0;
        this._batchIndexStart = 0;
        this._batchIndexSize = 0;

        this.dirty = true;
    }

    public add(batchableObject: BatchableElement)
    {
        this._elements[this.elementSize++] = batchableObject;

        batchableObject.indexStart = this.indexSize;
        batchableObject.attributeStart = this.attributeSize;
        batchableObject.batcher = this;
        batchableObject.location = this.attributeStart;

        this.indexSize += batchableObject.indexSize;
        this.attributeStart += batchableObject.attributeSize;
        this.attributeSize += ((batchableObject.attributeSize) * this.activeBatcher.attributeSize);
    }

    public checkAndUpdateTexture(batchableObject: BatchableElement, texture: Texture): boolean
    {
        const textureId = batchableObject.batch.textures.ids[texture._source.uid];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (!textureId && textureId !== 0) return false;

        batchableObject.textureId = textureId;
        batchableObject.texture = texture;

        return true;
    }

    public updateElement(batchableObject: BatchableElement)
    {
        this.dirty = true;

        if (batchableObject.packAsQuad)
        {
            this.activeBatcher.packQuadAttributes(
                batchableObject as BatchableQuadElement,
                this.attributeBuffer.float32View,
                this.attributeBuffer.uint32View,
                batchableObject.attributeStart, batchableObject.textureId);
        }
        else
        {
            this.activeBatcher.packAttributes(
                batchableObject as BatchableMeshElement,
                this.attributeBuffer.float32View,
                this.attributeBuffer.uint32View,
                batchableObject.attributeStart, batchableObject.textureId);
        }
    }

    /**
     * breaks the batcher. This happens when a batch gets too big,
     * or we need to switch to a different type of rendering (a filter for example)
     * @param instructionSet
     */
    public break(instructionSet: InstructionSet)
    {
        const elements = this._elements;

        // length 0??!! (we broke without adding anything)
        if (!elements[this.elementStart]) return;

        let batch = getBatchFromPool();
        let textureBatch = batch.textures;

        textureBatch.clear();

        const firstElement = elements[this.elementStart];
        let blendMode = getAdjustedBlendModeBlend(firstElement.blendMode, firstElement.texture._source);
        let batcherName = firstElement.batcherName;

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

        const maxTextures = this.maxTextures;

        const activeBatcher = this.activeBatcher;

        for (let i = this.elementStart; i < this.elementSize; ++i)
        {
            const element = elements[i];

            elements[i] = null;

            const texture = element.texture;
            const source = texture._source;

            const adjustedBlendMode = getAdjustedBlendModeBlend(element.blendMode, source);

            const breakRequired = blendMode !== adjustedBlendMode || batcherName !== element.batcherName;

            if (source._batchTick === BATCH_TICK && !breakRequired)
            {
                element.textureId = source._textureBindLocation;

                size += element.indexSize;

                if (element.packAsQuad)
                {
                    activeBatcher.packQuadAttributes(
                        element as BatchableQuadElement,
                        f32, u32,
                        element.attributeStart, element.textureId
                    );
                    this.packQuadIndex(iBuffer, element.indexStart, element.location);
                }
                else
                {
                    activeBatcher.packAttributes(
                        element as BatchableMeshElement,
                        f32, u32,
                        element.attributeStart,
                        element.textureId
                    );
                    this.packIndex(element as BatchableMeshElement, iBuffer, element.indexStart, element.location);
                }

                element.batch = batch;

                continue;
            }

            source._batchTick = BATCH_TICK;

            if (textureBatch.count >= maxTextures || breakRequired)
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
                batcherName = element.batcherName;

                batch = getBatchFromPool();
                textureBatch = batch.textures;
                textureBatch.clear();

                ++BATCH_TICK;
            }

            element.textureId = source._textureBindLocation = textureBatch.count;
            textureBatch.ids[source.uid] = textureBatch.count;
            textureBatch.textures[textureBatch.count++] = source;
            element.batch = batch;

            size += element.indexSize;

            if (element.packAsQuad)
            {
                activeBatcher.packQuadAttributes(
                    element as BatchableQuadElement,
                    f32, u32,
                    element.attributeStart, element.textureId
                );
                this.packQuadIndex(iBuffer, element.indexStart, element.location);
            }
            else
            {
                activeBatcher.packAttributes(element as BatchableMeshElement,
                    f32, u32,
                    element.attributeStart, element.textureId
                );

                this.packIndex(element as BatchableMeshElement, iBuffer, element.indexStart, element.location);
            }
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
        batch.bindGroup = null;
        batch.action = action;

        batch.batcher = this;
        batch.textures = textureBatch;
        batch.blendMode = blendMode;

        batch.start = indexStart;
        batch.size = indexSize;

        ++BATCH_TICK;

        // track for returning later!
        this.batches[this.batchIndex++] = batch;
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

    public packQuadIndex(indexBuffer: IndexBufferArray, index: number, indicesOffset: number)
    {
        indexBuffer[index] = indicesOffset + 0;
        indexBuffer[index + 1] = indicesOffset + 1;
        indexBuffer[index + 2] = indicesOffset + 2;

        indexBuffer[index + 3] = indicesOffset + 0;
        indexBuffer[index + 4] = indicesOffset + 2;
        indexBuffer[index + 5] = indicesOffset + 3;
    }

    public packIndex(element: BatchableMeshElement, indexBuffer: IndexBufferArray, index: number, indicesOffset: number)
    {
        const indices = element.indices;
        const size = element.indexSize;
        const indexOffset = element.indexOffset;
        const attributeOffset = element.attributeOffset;

        for (let i = 0; i < size; i++)
        {
            indexBuffer[index++] = indicesOffset + indices[i + indexOffset] - attributeOffset;
        }
    }

    public destroy()
    {
        for (let i = 0; i < this.batches.length; i++)
        {
            returnBatchToPool(this.batches[i]);
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

