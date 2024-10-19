import { uid } from '../../../utils/data/uid';
import { ViewableBuffer } from '../../../utils/data/ViewableBuffer';
import { fastCopy } from '../../renderers/shared/buffer/utils/fastCopy';
import { type BLEND_MODES } from '../../renderers/shared/state/const';
import { getAdjustedBlendModeBlend } from '../../renderers/shared/state/getAdjustedBlendModeBlend';
import { getMaxTexturesPerBatch } from '../gl/utils/maxRecommendedTextures';
import { BatchTextureArray } from './BatchTextureArray';

import type { BoundsData } from '../../../scene/container/bounds/Bounds';
import type { BindGroup } from '../../renderers/gpu/shader/BindGroup';
import type { Topology } from '../../renderers/shared/geometry/const';
import type { Geometry, IndexBufferArray } from '../../renderers/shared/geometry/Geometry';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { Shader } from '../../renderers/shared/shader/Shader';
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
    public topology: Topology = 'triangle-strip';

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

/**
 * Represents an element that can be batched for rendering.
 * @interface
 * @memberof rendering
 */
export interface BatchableElement
{
    /**
     * The name of the batcher to use. Must be registered.
     * @type {string}
     */
    batcherName: string;

    /**
     * The texture to be used for rendering.
     * @type {Texture}
     */
    texture: Texture;

    /**
     * The blend mode to be applied.
     * @type {BLEND_MODES}
     */
    blendMode: BLEND_MODES;

    /**
     * The size of the index data.
     * @type {number}
     */
    indexSize: number;

    /**
     * The size of the attribute data.
     * @type {number}
     */
    attributeSize: number;

    /**
     * The topology to be used for rendering.
     * @type {Topology}
     */
    topology: Topology

    /**
     * Whether the element should be packed as a quad for better performance.
     * @type {boolean}
     */
    packAsQuad: boolean;

    /**
     * The texture ID, stored for efficient updating.
     * @type {number}
     * @private
     */
    _textureId: number;

    /**
     * The starting position in the attribute buffer.
     * @type {number}
     * @private
     */
    _attributeStart: number;

    /**
     * The starting position in the index buffer.
     * @type {number}
     * @private
     */
    _indexStart: number;

    /**
     * Reference to the batcher.
     * @type {Batcher}
     * @private
     */
    _batcher: Batcher;

    /**
     * Reference to the batch.
     * @type {Batch}
     * @private
     */
    _batch: Batch;

}

/**
 * Represents a batchable quad element.
 * @extends BatchableElement
 * @memberof rendering
 */
export interface BatchableQuadElement extends BatchableElement
{
    /**
     * Indicates that this element should be packed as a quad.
     * @type {true}
     */
    packAsQuad: true;

    /**
     * The size of the attribute data for this quad element.
     * @type {4}
     */
    attributeSize: 4;

    /**
     * The size of the index data for this quad element.
     * @type {6}
     */
    indexSize: 6;

    /**
     * The bounds data for this quad element.
     * @type {BoundsData}
     */
    bounds: BoundsData;
}

/**
 * Represents a batchable mesh element.
 * @extends BatchableElement
 * @memberof rendering
 */
export interface BatchableMeshElement extends BatchableElement
{
    /**
     * The UV coordinates of the mesh.
     * @type {number[] | Float32Array}
     */
    uvs: number[] | Float32Array;

    /**
     * The vertex positions of the mesh.
     * @type {number[] | Float32Array}
     */
    positions: number[] | Float32Array;

    /**
     * The indices of the mesh.
     * @type {number[] | Uint16Array | Uint32Array}
     */
    indices: number[] | Uint16Array | Uint32Array;

    /**
     * The offset in the index buffer.
     * @type {number}
     */
    indexOffset: number;

    /**
     * The offset in the attribute buffer.
     * @type {number}
     */
    attributeOffset: number;

    /**
     * Indicates that this element should not be packed as a quad.
     * @type {false}
     */
    packAsQuad: false;
}

let BATCH_TICK = 0;

/**
 * The options for the batcher.
 * @memberof rendering
 */
export interface BatcherOptions
{
    /** The maximum number of textures per batch. */
    maxTextures?: number;
    attributesInitialSize?: number;
    indicesInitialSize?: number;
}

/**
 * A batcher is used to batch together objects with the same texture.
 * It is an abstract class that must be extended. see DefaultBatcher for an example.
 * @memberof rendering
 */
export abstract class Batcher
{
    public static defaultOptions: Partial<BatcherOptions> = {
        maxTextures: null,
        attributesInitialSize: 4,
        indicesInitialSize: 6,
    };

    /** unique id for this batcher */
    public readonly uid: number = uid('batcher');

    /** The buffer containing attribute data for all elements in the batch. */
    public attributeBuffer: ViewableBuffer;

    /** The buffer containing index data for all elements in the batch. */
    public indexBuffer: IndexBufferArray;

    /** The current size of the attribute data in the batch. */
    public attributeSize: number;

    /** The current size of the index data in the batch. */
    public indexSize: number;

    /** The total number of elements currently in the batch. */
    public elementSize: number;

    /** The starting index of elements in the current batch. */
    public elementStart: number;

    /** Indicates whether the batch data has been modified and needs updating. */
    public dirty = true;

    /** The current index of the batch being processed. */
    public batchIndex = 0;

    /** An array of all batches created during the current rendering process. */
    public batches: Batch[] = [];

    private _elements: BatchableElement[] = [];

    private _batchIndexStart: number;
    private _batchIndexSize: number;

    /** The maximum number of textures per batch. */
    public readonly maxTextures: number;

    /** The name of the batcher. Must be implemented by subclasses. */
    public abstract name: string;
    /** The vertex size of the batcher. Must be implemented by subclasses. */
    protected abstract vertexSize: number;

    /** The geometry used by this batcher. Must be implemented by subclasses. */
    public abstract geometry: Geometry;

    /**
     * The shader used by this batcher. Must be implemented by subclasses.
     * this can be shared by multiple batchers of the same type.
     */
    public abstract shader: Shader;

    /**
     * Packs the attributes of a BatchableMeshElement into the provided views.
     * Must be implemented by subclasses.
     * @param element - The BatchableMeshElement to pack.
     * @param float32View - The Float32Array view to pack into.
     * @param uint32View - The Uint32Array view to pack into.
     * @param index - The starting index in the views.
     * @param textureId - The texture ID to use.
     */
    public abstract packAttributes(
        element: BatchableMeshElement,
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    ): void;

    /**
     * Packs the attributes of a BatchableQuadElement into the provided views.
     * Must be implemented by subclasses.
     * @param element - The BatchableQuadElement to pack.
     * @param float32View - The Float32Array view to pack into.
     * @param uint32View - The Uint32Array view to pack into.
     * @param index - The starting index in the views.
     * @param textureId - The texture ID to use.
     */
    public abstract packQuadAttributes(
        element: BatchableQuadElement,
        float32View: Float32Array,
        uint32View: Uint32Array,
        index: number,
        textureId: number
    ): void;

    constructor(options: BatcherOptions = {})
    {
        Batcher.defaultOptions.maxTextures = Batcher.defaultOptions.maxTextures ?? getMaxTexturesPerBatch();
        options = { ...Batcher.defaultOptions, ...options };

        const { maxTextures, attributesInitialSize, indicesInitialSize } = options;

        this.attributeBuffer = new ViewableBuffer(attributesInitialSize * 4);

        this.indexBuffer = new Uint16Array(indicesInitialSize);

        this.maxTextures = maxTextures;
    }

    public begin()
    {
        this.elementSize = 0;
        this.elementStart = 0;
        this.indexSize = 0;
        this.attributeSize = 0;

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

        batchableObject._indexStart = this.indexSize;
        batchableObject._attributeStart = this.attributeSize;
        batchableObject._batcher = this;

        this.indexSize += batchableObject.indexSize;
        this.attributeSize += ((batchableObject.attributeSize) * this.vertexSize);
    }

    public checkAndUpdateTexture(batchableObject: BatchableElement, texture: Texture): boolean
    {
        const textureId = batchableObject._batch.textures.ids[texture._source.uid];

        // TODO could try to be a bit smarter if there are spare textures..
        // but need to figure out how to alter the bind groups too..
        if (!textureId && textureId !== 0) return false;

        batchableObject._textureId = textureId;
        batchableObject.texture = texture;

        return true;
    }

    public updateElement(batchableObject: BatchableElement)
    {
        this.dirty = true;

        const attributeBuffer = this.attributeBuffer;

        if (batchableObject.packAsQuad)
        {
            this.packQuadAttributes(
                batchableObject as BatchableQuadElement,
                attributeBuffer.float32View,
                attributeBuffer.uint32View,
                batchableObject._attributeStart, batchableObject._textureId);
        }
        else
        {
            this.packAttributes(
                batchableObject as BatchableMeshElement,
                attributeBuffer.float32View,
                attributeBuffer.uint32View,
                batchableObject._attributeStart, batchableObject._textureId);
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
        let topology = firstElement.topology;

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
        const indexBuffer = this.indexBuffer;

        let size = this._batchIndexSize;
        let start = this._batchIndexStart;

        let action: BatchAction = 'startBatch';

        const maxTextures = this.maxTextures;

        for (let i = this.elementStart; i < this.elementSize; ++i)
        {
            const element = elements[i];

            elements[i] = null;

            const texture = element.texture;
            const source = texture._source;

            const adjustedBlendMode = getAdjustedBlendModeBlend(element.blendMode, source);

            const breakRequired = blendMode !== adjustedBlendMode || topology !== element.topology;

            if (source._batchTick === BATCH_TICK && !breakRequired)
            {
                element._textureId = source._textureBindLocation;

                size += element.indexSize;

                if (element.packAsQuad)
                {
                    this.packQuadAttributes(
                        element as BatchableQuadElement,
                        f32, u32,
                        element._attributeStart, element._textureId
                    );
                    this.packQuadIndex(
                        indexBuffer,
                        element._indexStart,
                        element._attributeStart / this.vertexSize
                    );
                }
                else
                {
                    this.packAttributes(
                        element as BatchableMeshElement,
                        f32, u32,
                        element._attributeStart,
                        element._textureId
                    );
                    this.packIndex(
                        element as BatchableMeshElement,
                        indexBuffer,
                        element._indexStart,
                        element._attributeStart / this.vertexSize
                    );
                }

                element._batch = batch;

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
                    topology,
                    instructionSet,
                    action
                );

                action = 'renderBatch';
                start = size;
                // create a batch...
                blendMode = adjustedBlendMode;
                topology = element.topology;

                batch = getBatchFromPool();
                textureBatch = batch.textures;
                textureBatch.clear();

                ++BATCH_TICK;
            }

            element._textureId = source._textureBindLocation = textureBatch.count;
            textureBatch.ids[source.uid] = textureBatch.count;
            textureBatch.textures[textureBatch.count++] = source;
            element._batch = batch;

            size += element.indexSize;

            if (element.packAsQuad)
            {
                this.packQuadAttributes(
                    element as BatchableQuadElement,
                    f32, u32,
                    element._attributeStart, element._textureId
                );
                this.packQuadIndex(
                    indexBuffer,
                    element._indexStart,
                    element._attributeStart / this.vertexSize
                );
            }
            else
            {
                this.packAttributes(element as BatchableMeshElement,
                    f32, u32,
                    element._attributeStart, element._textureId
                );

                this.packIndex(
                    element as BatchableMeshElement,
                    indexBuffer,
                    element._indexStart,
                    element._attributeStart / this.vertexSize
                );
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
                topology,
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
        topology: Topology,
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
        batch.topology = topology;
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
            this._elements[i]._batch = null;
        }

        this._elements = null;

        this.indexBuffer = null;

        this.attributeBuffer.destroy();
        this.attributeBuffer = null;
    }
}

