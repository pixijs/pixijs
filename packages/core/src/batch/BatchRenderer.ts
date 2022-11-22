import { BatchDrawCall } from './BatchDrawCall';
import { BatchTextureArray } from './BatchTextureArray';
import { BaseTexture } from '../textures/BaseTexture';
import { ObjectRenderer } from './ObjectRenderer';
import { State } from '../state/State';
import { ViewableBuffer } from '../geometry/ViewableBuffer';
import { BatchShaderGenerator } from './BatchShaderGenerator';
import { checkMaxIfStatementsInShader } from '../shader/utils/checkMaxIfStatementsInShader';

import { settings } from '@pixi/settings';
import { premultiplyBlendMode, premultiplyTint, nextPow2, log2, deprecation } from '@pixi/utils';
import { ENV } from '@pixi/constants';
import { BatchGeometry } from './BatchGeometry';

import defaultVertex from './texture.vert';
import defaultFragment from './texture.frag';

import type { Renderer } from '../Renderer';
import type { Shader } from '../shader/Shader';
import type { Texture } from '../textures/Texture';
import type { BLEND_MODES } from '@pixi/constants';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';
import { maxRecommendedTextures } from './maxRecommendedTextures';
import { canUploadSameBuffer } from './canUploadSameBuffer';

/**
 * Interface for elements like Sprite, Mesh etc. for batching.
 * @memberof PIXI
 */
export interface IBatchableElement
{
    _texture: Texture;
    vertexData: Float32Array;
    indices: Uint16Array | Uint32Array | Array<number>;
    uvs: Float32Array;
    worldAlpha: number;
    _tintRGB: number;
    blendMode: BLEND_MODES;
}

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * This is the default batch renderer. It buffers objects
 * with texture-based geometries and renders them in
 * batches. It uploads multiple textures to the GPU to
 * reduce to the number of draw calls.
 * @memberof PIXI
 */
export class BatchRenderer extends ObjectRenderer
{
    /**
     * The maximum textures that this device supports.
     * @static
     * @default 32
     */
    public static get defaultMaxTextures(): number
    {
        this._defaultMaxTextures = this._defaultMaxTextures ?? maxRecommendedTextures(32);

        return this._defaultMaxTextures;
    }
    public static set defaultMaxTextures(value: number)
    {
        this._defaultMaxTextures = value;
    }

    /** @ignore */
    private static _defaultMaxTextures: number;

    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     * @static
     */
    public static defaultBatchSize = 4096;

    /**
     * Can we upload the same buffer in a single frame?
     * @static
     */
    public static get canUploadSameBuffer(): boolean
    {
        this._canUploadSameBuffer = this._canUploadSameBuffer ?? canUploadSameBuffer();

        return this._canUploadSameBuffer;
    }
    public static set canUploadSameBuffer(value: boolean)
    {
        this._canUploadSameBuffer = value;
    }

    /** @ignore */
    private static _canUploadSameBuffer: boolean;

    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'batch',
        type: ExtensionType.RendererPlugin,
    };

    /** The WebGL state in which this renderer will work. */
    public readonly state: State;

    /**
     * The number of bufferable objects before a flush
     * occurs automatically.
     * @default PIXI.BatchRenderer.defaultBatchSize * 4
     */
    public size: number;

    /**
     * Maximum number of textures that can be uploaded to
     * the GPU under the current context. It is initialized
     * properly in `this.contextChange`.
     * @see PIXI.BatchRenderer#contextChange
     * @readonly
     */
    public maxTextures: number;

    /**
     * This is used to generate a shader that can
     * color each vertex based on a `aTextureId`
     * attribute that points to an texture in `uSampler`.
     *
     * This enables the objects with different textures
     * to be drawn in the same draw call.
     *
     * You can customize your shader by creating your
     * custom shader generator.
     */
    protected shaderGenerator: BatchShaderGenerator;

    /**
     * The class that represents the geometry of objects
     * that are going to be batched with this.
     * @member {object}
     * @default PIXI.BatchGeometry
     */
    protected geometryClass: typeof BatchGeometry;

    /**
     * Size of data being buffered per vertex in the
     * attribute buffers (in floats). By default, the
     * batch-renderer plugin uses 6:
     *
     * | aVertexPosition | 2 |
     * |-----------------|---|
     * | aTextureCoords  | 2 |
     * | aColor          | 1 |
     * | aTextureId      | 1 |
     * @default 6
     */
    protected vertexSize: number;

    /** Total count of all vertices used by the currently buffered objects. */
    protected _vertexCount: number;

    /** Total count of all indices used by the currently buffered objects. */
    protected _indexCount: number;

    /**
     * Buffer of objects that are yet to be rendered.
     * @member {PIXI.DisplayObject[]}
     */
    protected _bufferedElements: Array<IBatchableElement>;

    /**
     * Data for texture batch builder, helps to save a bit of CPU on a pass.
     * @member {PIXI.BaseTexture[]}
     */
    protected _bufferedTextures: Array<BaseTexture>;

    /** Number of elements that are buffered and are waiting to be flushed. */
    protected _bufferSize: number;

    /**
     * This shader is generated by `this.shaderGenerator`.
     *
     * It is generated specifically to handle the required
     * number of textures being batched together.
     */
    protected _shader: Shader;

    /**
     * A flush may occur multiple times in a single
     * frame. On iOS devices or when
     * `BatchRenderer.canUploadSameBuffer` is false, the
     * batch renderer does not upload data to the same
     * `WebGLBuffer` for performance reasons.
     *
     * This is the index into `packedGeometries` that points to
     * geometry holding the most recent buffers.
     */
    protected _flushId: number;

    /**
     * Pool of `ViewableBuffer` objects that are sorted in
     * order of increasing size. The flush method uses
     * the buffer with the least size above the amount
     * it requires. These are used for passing attributes.
     *
     * The first buffer has a size of 8; each subsequent
     * buffer has double capacity of its previous.
     * @member {PIXI.ViewableBuffer[]}
     * @see PIXI.BatchRenderer#getAttributeBuffer
     */
    protected _aBuffers: Array<ViewableBuffer>;

    /**
     * Pool of `Uint16Array` objects that are sorted in
     * order of increasing size. The flush method uses
     * the buffer with the least size above the amount
     * it requires. These are used for passing indices.
     *
     * The first buffer has a size of 12; each subsequent
     * buffer has double capacity of its previous.
     * @member {Uint16Array[]}
     * @see PIXI.BatchRenderer#getIndexBuffer
     */
    protected _iBuffers: Array<Uint16Array>;
    protected _dcIndex: number;
    protected _aIndex: number;
    protected _iIndex: number;
    protected _attributeBuffer: ViewableBuffer;
    protected _indexBuffer: Uint16Array;
    protected _tempBoundTextures: BaseTexture[];

    /**
     * Pool of `this.geometryClass` geometry objects
     * that store buffers. They are used to pass data
     * to the shader on each draw call.
     *
     * These are never re-allocated again, unless a
     * context change occurs; however, the pool may
     * be expanded if required.
     * @member {PIXI.Geometry[]}
     * @see PIXI.BatchRenderer.contextChange
     */
    private _packedGeometries: Array<BatchGeometry>;

    /**
     * Size of `this._packedGeometries`. It can be expanded
     * if more than `this._packedGeometryPoolSize` flushes
     * occur in a single frame.
     */
    private _packedGeometryPoolSize: number;

    /**
     * This will hook onto the renderer's `contextChange`
     * and `prerender` signals.
     * @param {PIXI.Renderer} renderer - The renderer this works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.setShaderGenerator();
        this.geometryClass = BatchGeometry;
        this.vertexSize = 6;
        this.state = State.for2d();
        this.size = BatchRenderer.defaultBatchSize * 4;
        this._vertexCount = 0;
        this._indexCount = 0;
        this._bufferedElements = [];
        this._bufferedTextures = [];
        this._bufferSize = 0;
        this._shader = null;
        this._packedGeometries = [];
        this._packedGeometryPoolSize = 2;
        this._flushId = 0;
        this._aBuffers = {} as any;
        this._iBuffers = {} as any;

        this.maxTextures = 1;

        this.renderer.on('prerender', this.onPrerender, this);
        renderer.runners.contextChange.add(this);

        this._dcIndex = 0;
        this._aIndex = 0;
        this._iIndex = 0;
        this._attributeBuffer = null;
        this._indexBuffer = null;
        this._tempBoundTextures = [];
    }

    /**
     * @see PIXI.BatchRenderer#maxTextures
     * @deprecated since 7.1.0
     * @readonly
     */
    get MAX_TEXTURES(): number
    {
        // #if _DEBUG
        deprecation('7.1.0', 'BatchRenderer#MAX_TEXTURES renamed to BatchRenderer#maxTextures');
        // #endif

        return this.maxTextures;
    }

    /**
     * The default vertex shader source
     * @readonly
     */
    static get defaultVertexSrc(): string
    {
        return defaultVertex;
    }

    /**
     * The default fragment shader source
     * @readonly
     */
    static get defaultFragmentTemplate(): string
    {
        return defaultFragment;
    }

    /**
     * Set the shader generator.
     * @param {object} [options]
     * @param {string} [options.vertex=PIXI.BatchRenderer.defaultVertexSrc] - Vertex shader source
     * @param {string} [options.fragment=PIXI.BatchRenderer.defaultFragmentTemplate] - Fragment shader template
     */
    public setShaderGenerator({
        vertex = BatchRenderer.defaultVertexSrc,
        fragment = BatchRenderer.defaultFragmentTemplate
    }: { vertex?: string, fragment?: string } = {}): void
    {
        this.shaderGenerator = new BatchShaderGenerator(vertex, fragment);
    }

    /**
     * Handles the `contextChange` signal.
     *
     * It calculates `this.maxTextures` and allocating the packed-geometry object pool.
     */
    contextChange(): void
    {
        const gl = this.renderer.gl;

        if (settings.PREFER_ENV === ENV.WEBGL_LEGACY)
        {
            this.maxTextures = 1;
        }
        else
        {
            // step 1: first check max textures the GPU can handle.
            this.maxTextures = Math.min(
                gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                BatchRenderer.defaultMaxTextures);

            // step 2: check the maximum number of if statements the shader can have too..
            this.maxTextures = checkMaxIfStatementsInShader(
                this.maxTextures, gl);
        }

        this._shader = this.shaderGenerator.generateShader(this.maxTextures);

        // we use the second shader as the first one depending on your browser
        // may omit aTextureId as it is not used by the shader so is optimized out.
        for (let i = 0; i < this._packedGeometryPoolSize; i++)
        {
            /* eslint-disable max-len */
            this._packedGeometries[i] = new (this.geometryClass)();
        }

        this.initFlushBuffers();
    }

    /** Makes sure that static and dynamic flush pooled objects have correct dimensions. */
    initFlushBuffers(): void
    {
        const {
            _drawCallPool,
            _textureArrayPool,
        } = BatchRenderer;
        // max draw calls
        const MAX_SPRITES = this.size / 4;
        // max texture arrays
        const MAX_TA = Math.floor(MAX_SPRITES / this.maxTextures) + 1;

        while (_drawCallPool.length < MAX_SPRITES)
        {
            _drawCallPool.push(new BatchDrawCall());
        }
        while (_textureArrayPool.length < MAX_TA)
        {
            _textureArrayPool.push(new BatchTextureArray());
        }
        for (let i = 0; i < this.maxTextures; i++)
        {
            this._tempBoundTextures[i] = null;
        }
    }

    /** Handles the `prerender` signal. It ensures that flushes start from the first geometry object again. */
    onPrerender(): void
    {
        this._flushId = 0;
    }

    /**
     * Buffers the "batchable" object. It need not be rendered immediately.
     * @param {PIXI.DisplayObject} element - the element to render when
     *    using this renderer
     */
    render(element: IBatchableElement): void
    {
        if (!element._texture.valid)
        {
            return;
        }

        if (this._vertexCount + (element.vertexData.length / 2) > this.size)
        {
            this.flush();
        }

        this._vertexCount += element.vertexData.length / 2;
        this._indexCount += element.indices.length;
        this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
        this._bufferedElements[this._bufferSize++] = element;
    }

    buildTexturesAndDrawCalls(): void
    {
        const {
            _bufferedTextures: textures,
            maxTextures,
        } = this;
        const textureArrays = BatchRenderer._textureArrayPool;
        const batch = this.renderer.batch;
        const boundTextures = this._tempBoundTextures;
        const touch = this.renderer.textureGC.count;

        let TICK = ++BaseTexture._globalBatch;
        let countTexArrays = 0;
        let texArray = textureArrays[0];
        let start = 0;

        batch.copyBoundTextures(boundTextures, maxTextures);

        for (let i = 0; i < this._bufferSize; ++i)
        {
            const tex = textures[i];

            textures[i] = null;
            if (tex._batchEnabled === TICK)
            {
                continue;
            }

            if (texArray.count >= maxTextures)
            {
                batch.boundArray(texArray, boundTextures, TICK, maxTextures);
                this.buildDrawCalls(texArray, start, i);
                start = i;
                texArray = textureArrays[++countTexArrays];
                ++TICK;
            }

            tex._batchEnabled = TICK;
            tex.touched = touch;
            texArray.elements[texArray.count++] = tex;
        }

        if (texArray.count > 0)
        {
            batch.boundArray(texArray, boundTextures, TICK, maxTextures);
            this.buildDrawCalls(texArray, start, this._bufferSize);
            ++countTexArrays;
            ++TICK;
        }

        // Clean-up

        for (let i = 0; i < boundTextures.length; i++)
        {
            boundTextures[i] = null;
        }
        BaseTexture._globalBatch = TICK;
    }

    /**
     * Populating drawcalls for rendering
     * @param texArray
     * @param start
     * @param finish
     */
    buildDrawCalls(texArray: BatchTextureArray, start: number, finish: number): void
    {
        const {
            _bufferedElements: elements,
            _attributeBuffer,
            _indexBuffer,
            vertexSize,
        } = this;
        const drawCalls = BatchRenderer._drawCallPool;

        let dcIndex = this._dcIndex;
        let aIndex = this._aIndex;
        let iIndex = this._iIndex;

        let drawCall = drawCalls[dcIndex];

        drawCall.start = this._iIndex;
        drawCall.texArray = texArray;

        for (let i = start; i < finish; ++i)
        {
            const sprite = elements[i];
            const tex = sprite._texture.baseTexture;
            const spriteBlendMode = premultiplyBlendMode[
                tex.alphaMode ? 1 : 0][sprite.blendMode];

            elements[i] = null;

            if (start < i && drawCall.blend !== spriteBlendMode)
            {
                drawCall.size = iIndex - drawCall.start;
                start = i;
                drawCall = drawCalls[++dcIndex];
                drawCall.texArray = texArray;
                drawCall.start = iIndex;
            }

            this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
            aIndex += sprite.vertexData.length / 2 * vertexSize;
            iIndex += sprite.indices.length;

            drawCall.blend = spriteBlendMode;
        }

        if (start < finish)
        {
            drawCall.size = iIndex - drawCall.start;
            ++dcIndex;
        }

        this._dcIndex = dcIndex;
        this._aIndex = aIndex;
        this._iIndex = iIndex;
    }

    /**
     * Bind textures for current rendering
     * @param texArray
     */
    bindAndClearTexArray(texArray: BatchTextureArray): void
    {
        const textureSystem = this.renderer.texture;

        for (let j = 0; j < texArray.count; j++)
        {
            textureSystem.bind(texArray.elements[j], texArray.ids[j]);
            texArray.elements[j] = null;
        }
        texArray.count = 0;
    }

    updateGeometry(): void
    {
        const {
            _packedGeometries: packedGeometries,
            _attributeBuffer: attributeBuffer,
            _indexBuffer: indexBuffer,
        } = this;

        if (!BatchRenderer.canUploadSameBuffer)
        { /* Usually on iOS devices, where the browser doesn't
            like uploads to the same buffer in a single frame. */
            if (this._packedGeometryPoolSize <= this._flushId)
            {
                this._packedGeometryPoolSize++;
                packedGeometries[this._flushId] = new (this.geometryClass)();
            }

            packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
            packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

            this.renderer.geometry.bind(packedGeometries[this._flushId]);
            this.renderer.geometry.updateBuffers();
            this._flushId++;
        }
        else
        {
            // lets use the faster option, always use buffer number 0
            packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
            packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

            this.renderer.geometry.updateBuffers();
        }
    }

    drawBatches(): void
    {
        const dcCount = this._dcIndex;
        const { gl, state: stateSystem } = this.renderer;
        const drawCalls = BatchRenderer._drawCallPool;

        let curTexArray = null;

        // Upload textures and do the draw calls
        for (let i = 0; i < dcCount; i++)
        {
            const { texArray, type, size, start, blend } = drawCalls[i];

            if (curTexArray !== texArray)
            {
                curTexArray = texArray;
                this.bindAndClearTexArray(texArray);
            }

            this.state.blendMode = blend;
            stateSystem.set(this.state);
            gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
        }
    }

    /** Renders the content _now_ and empties the current batch. */
    flush(): void
    {
        if (this._vertexCount === 0)
        {
            return;
        }

        this._attributeBuffer = this.getAttributeBuffer(this._vertexCount);
        this._indexBuffer = this.getIndexBuffer(this._indexCount);
        this._aIndex = 0;
        this._iIndex = 0;
        this._dcIndex = 0;

        this.buildTexturesAndDrawCalls();
        this.updateGeometry();
        this.drawBatches();

        // reset elements buffer for the next flush
        this._bufferSize = 0;
        this._vertexCount = 0;
        this._indexCount = 0;
    }

    /** Starts a new sprite batch. */
    start(): void
    {
        this.renderer.state.set(this.state);

        this.renderer.texture.ensureSamplerType(this.maxTextures);

        this.renderer.shader.bind(this._shader);

        if (BatchRenderer.canUploadSameBuffer)
        {
            // bind buffer #0, we don't need others
            this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
        }
    }

    /** Stops and flushes the current batch. */
    stop(): void
    {
        this.flush();
    }

    /** Destroys this `BatchRenderer`. It cannot be used again. */
    destroy(): void
    {
        for (let i = 0; i < this._packedGeometryPoolSize; i++)
        {
            if (this._packedGeometries[i])
            {
                this._packedGeometries[i].destroy();
            }
        }

        this.renderer.off('prerender', this.onPrerender, this);

        this._aBuffers = null;
        this._iBuffers = null;
        this._packedGeometries = null;
        this._attributeBuffer = null;
        this._indexBuffer = null;

        if (this._shader)
        {
            this._shader.destroy();
            this._shader = null;
        }

        super.destroy();
    }

    /**
     * Fetches an attribute buffer from `this._aBuffers` that can hold atleast `size` floats.
     * @param size - minimum capacity required
     * @returns - buffer than can hold atleast `size` floats
     */
    getAttributeBuffer(size: number): ViewableBuffer
    {
        // 8 vertices is enough for 2 quads
        const roundedP2 = nextPow2(Math.ceil(size / 8));
        const roundedSizeIndex = log2(roundedP2);
        const roundedSize = roundedP2 * 8;

        if (this._aBuffers.length <= roundedSizeIndex)
        {
            this._iBuffers.length = roundedSizeIndex + 1;
        }

        let buffer = this._aBuffers[roundedSize];

        if (!buffer)
        {
            this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize * this.vertexSize * 4);
        }

        return buffer;
    }

    /**
     * Fetches an index buffer from `this._iBuffers` that can
     * have at least `size` capacity.
     * @param size - minimum required capacity
     * @returns - buffer that can fit `size` indices.
     */
    getIndexBuffer(size: number): Uint16Array
    {
        // 12 indices is enough for 2 quads
        const roundedP2 = nextPow2(Math.ceil(size / 12));
        const roundedSizeIndex = log2(roundedP2);
        const roundedSize = roundedP2 * 12;

        if (this._iBuffers.length <= roundedSizeIndex)
        {
            this._iBuffers.length = roundedSizeIndex + 1;
        }

        let buffer = this._iBuffers[roundedSizeIndex];

        if (!buffer)
        {
            this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize);
        }

        return buffer;
    }

    /**
     * Takes the four batching parameters of `element`, interleaves
     * and pushes them into the batching attribute/index buffers given.
     *
     * It uses these properties: `vertexData` `uvs`, `textureId` and
     * `indicies`. It also uses the "tint" of the base-texture, if
     * present.
     * @param {PIXI.DisplayObject} element - element being rendered
     * @param attributeBuffer - attribute buffer.
     * @param indexBuffer - index buffer
     * @param aIndex - number of floats already in the attribute buffer
     * @param iIndex - number of indices already in `indexBuffer`
     */
    packInterleavedGeometry(element: IBatchableElement, attributeBuffer: ViewableBuffer, indexBuffer: Uint16Array,
        aIndex: number, iIndex: number): void
    {
        const {
            uint32View,
            float32View,
        } = attributeBuffer;

        const packedVertices = aIndex / this.vertexSize;
        const uvs = element.uvs;
        const indicies = element.indices;
        const vertexData = element.vertexData;
        const textureId = element._texture.baseTexture._batchLocation;

        const alpha = Math.min(element.worldAlpha, 1.0);
        const argb = (alpha < 1.0
            && element._texture.baseTexture.alphaMode)
            ? premultiplyTint(element._tintRGB, alpha)
            : element._tintRGB + (alpha * 255 << 24);

        // lets not worry about tint! for now..
        for (let i = 0; i < vertexData.length; i += 2)
        {
            float32View[aIndex++] = vertexData[i];
            float32View[aIndex++] = vertexData[i + 1];
            float32View[aIndex++] = uvs[i];
            float32View[aIndex++] = uvs[i + 1];
            uint32View[aIndex++] = argb;
            float32View[aIndex++] = textureId;
        }

        for (let i = 0; i < indicies.length; i++)
        {
            indexBuffer[iIndex++] = packedVertices + indicies[i];
        }
    }

    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     * @member {PIXI.BatchDrawCall[]}
     */
    static _drawCallPool: Array<BatchDrawCall> = [];

    /**
     * Pool of `BatchDrawCall` objects that `flush` used
     * to create "batches" of the objects being rendered.
     *
     * These are never re-allocated again.
     * Shared between all batch renderers because it can be only one "flush" working at the moment.
     * @member {PIXI.BatchTextureArray[]}
     */
    static _textureArrayPool: Array<BatchTextureArray> = [];
}

// Install BatchRenderer as default
extensions.add(BatchRenderer);
