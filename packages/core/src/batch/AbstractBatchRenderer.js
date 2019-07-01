import BatchDrawCall from './BatchDrawCall';
import BaseTexture from '../textures/BaseTexture';
import State from '../state/State';
import ObjectRenderer from './ObjectRenderer';
import checkMaxIfStatementsInShader from '../shader/utils/checkMaxIfStatementsInShader';
import { settings } from '@pixi/settings';
import { premultiplyBlendMode, premultiplyTint, nextPow2, log2 } from '@pixi/utils';
import BatchBuffer from './BatchBuffer';
import { ENV } from '@pixi/constants';

/**
 * Sizes of built-in attributes provided by `BatchRenderer`,
 * which includes the required `aTextureId` attribute.
 *
 * @type Map<string, number>
 * @see {AbstractBatchRenderer#vertexSizeOf}
 */
const builtinAttributeSizes = {
    aColor: 1,
    aTextureId: 1,
};

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * This is the default batch renderer. It buffers objects
 * with texture-based geometries and renders them in
 * batches. It uploads multiple textures to the GPU to
 * reduce to the number of draw calls.
 *
 * @class
 * @protected
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class AbstractBatchRenderer extends ObjectRenderer
{
    /**
     * This will hook onto the renderer's `contextChange`
     * and `prerender` signals.
     *
     * @param {PIXI.Renderer} renderer - The renderer this works for.
     */
    constructor(renderer)
    {
        super(renderer);

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
         *
         * @member {PIXI.BatchShaderGenerator}
         * @readonly
         */
        this.shaderGenerator = null;

        /**
         * The class that represents the geometry of objects
         * that are going to be batched with this.
         *
         * @member {object}
         * @default PIXI.BatchGeometry
         * @readonly
         */
        this.geometryClass = null;

        /**
         * Array of attribute definitions that are described
         * below. These are used to pass attribute data
         * from your objects to the vertex shader.
         *
         * An attribute definition is an object with the
         * following properties:
         *
         * | Property   | Description                                   |
         * |------------|-----------------------------------------------|
         * | property   | Property name in objects for attribute data   |
         * | identifier | Name of attribute variable used in the shader |
         * | size       | Size of each attribute element in floats      |
         *
         * `BatchRenderer` provides a few built-in attributes
         * that you can use like `aColor`. Instead of the
         * attribute definition, just give the identifier to
         * use them.
         *
         * The `attribute float aTextureId` attribute should
         * _always_ be present in your shader. See
         * `PIXI.BatchShaderGenerator` for more details.
         *
         * NOTE: It is expected that the attribute buffers
         * store an equal number of elements. For example,
         * `object.vertexData.length = object.uvs.length`. Otherwise,
         * wrapping will occur so that the attribute data is repeated
         * for each vertex.
         *
         * @default
         * | Index | AttributeDefinition                                                |
         * |-------|--------------------------------------------------------------------|
         * | 0     | `{ property: vertexData, identifier: 'aVertexPosition', size: 2 }` |
         * | 1     | `{ property: uvs, identifier: 'aTextureCoord', size: 2 }`          |
         * | 2     | `'aColor'`                                                         |
         * | 3     | `'aTextureId'` // mandatory                                        |
         *
         * @readonly
         */
        this.attributeDefinitions = null;

        /**
         * Size of data being buffered per vertex in the
         * attribute buffers (in floats). By default, the
         * batch-renderer plugin uses 6:
         *
         * | Attribute       | Size |
         * |-----------------|------|
         * | aVertexPosition | 2    |
         * | aTextureCoords  | 2    |
         * | aColor          | 1    |
         * | aTextureId      | 1    |
         *
         * @member {number} vertexSize
         * @readonly
         */
        this.vertexSize = null;

        /**
         * The WebGL state in which this renderer will work.
         *
         * @member {PIXI.State}
         * @readonly
         */
        this.state = State.for2d();

        /**
         * The number of bufferable objects before a flush
         * occurs automatically.
         *
         * @member {number}
         * @default settings.SPRITE_MAX_TEXTURES
         */
        this.size = 2000 * 4;// settings.SPRITE_BATCH_SIZE, 2000 is a nice balance between mobile/desktop

        /**
         * Total count of all vertices used by the currently
         * buffered objects.
         *
         * @member {number}
         * @private
         */
        this._vertexCount = 0;

        /**
         * Total count of all indices used by the currently
         * buffered objects.
         *
         * @member {number}
         * @private
         */
        this._indexCount = 0;

        /**
         * Buffer of objects that are yet to be rendered.
         *
         * @member {PIXI.DisplayObject[]}
         * @private
         */
        this._bufferedElements = [];

        /**
         * Number of elements that are buffered and are
         * waiting to be flushed.
         *
         * @member {number}
         * @private
         */
        this._bufferSize = 0;

        /**
         * This shader is generated by `this.shaderGenerator`.
         *
         * It is generated specifically to handle the required
         * number of textures being batched together.
         *
         * @member {PIXI.Shader}
         * @private
         */
        this._shader = null;

        /**
         * Pool of `this.geometryClass` geometry objects
         * that store buffers. They are used to pass data
         * to the shader on each draw call.
         *
         * These are never re-allocated again, unless a
         * context change occurs; however, the pool may
         * be expanded if required.
         *
         * @member {PIXI.Geometry[]}
         * @private
         * @see PIXI.BatchRenderer.contextChange
         */
        this._packedGeometries = [];

        /**
         * Size of `this._packedGeometries`. It can be expanded
         * if more than `this._packedGeometryPoolSize` flushes
         * occur in a single frame.
         *
         * @member {number}
         * @private
         */
        this._packedGeometryPoolSize = 2;

        /**
         * A flush may occur multiple times in a single
         * frame. On iOS devices or when
         * `settings.CAN_UPLOAD_SAME_BUFFER` is false, the
         * batch renderer does not upload data to the same
         * `WebGLBuffer` for performance reasons.
         *
         * This is the index into `packedGeometries` that points to
         * geometry holding the most recent buffers.
         *
         * @member {number}
         * @private
         */
        this._flushId = 0;

        /**
         * Pool of `BatchDrawCall` objects that `flush` uses
         * to create "batches" of the objects being rendered.
         *
         * These are never re-allocated again.
         *
         * @member BatchDrawCall[]
         * @private
         */
        this._drawCalls = [];

        for (let k = 0; k < this.size / 4; k++)
        { // initialize the draw-calls pool to max size.
            this._drawCalls[k] = new BatchDrawCall();
        }

        /**
         * Pool of `BatchBuffer` objects that are sorted in
         * order of increasing size. The flush method uses
         * the buffer with the least size above the amount
         * it requires. These are used for passing attributes.
         *
         * The first buffer has a size of 8; each subsequent
         * buffer has double capacity of its previous.
         *
         * @member {PIXI.BatchBuffer}
         * @private
         * @see PIXI.BatchRenderer#getAttributeBuffer
         */
        this._aBuffers = {};

        /**
         * Pool of `Uint16Array` objects that are sorted in
         * order of increasing size. The flush method uses
         * the buffer with the least size above the amount
         * it requires. These are used for passing indices.
         *
         * The first buffer has a size of 12; each subsequent
         * buffer has double capacity of its previous.
         *
         * @member {Uint16Array[]}
         * @private
         * @see PIXI.BatchRenderer#getIndexBuffer
         */
        this._iBuffers = {};

        /**
         * Maximum number of textures that can be uploaded to
         * the GPU under the current context. It is initialized
         * properly in `this.contextChange`.
         *
         * @member {number}
         * @see PIXI.BatchRenderer#contextChange
         * @readonly
         */
        this.MAX_TEXTURES = 1;

        this.renderer.on('prerender', this.onPrerender, this);
        renderer.runners.contextChange.add(this);
    }

    /**
     * Handles the `contextChange` signal.
     *
     * It calculates `this.MAX_TEXTURES` and allocating the
     * packed-geometry object pool.
     */
    contextChange()
    {
        const gl = this.renderer.gl;

        if (settings.PREFER_ENV === ENV.WEBGL_LEGACY)
        {
            this.MAX_TEXTURES = 1;
        }
        else
        {
            // step 1: first check max textures the GPU can handle.
            this.MAX_TEXTURES = Math.min(
                gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                settings.SPRITE_MAX_TEXTURES);

            // step 2: check the maximum number of if statements the shader can have too..
            this.MAX_TEXTURES = checkMaxIfStatementsInShader(
                this.MAX_TEXTURES, gl);
        }

        this._shader = this.shaderGenerator.generateShader(this.MAX_TEXTURES);

        // we use the second shader as the first one depending on your browser
        // may omit aTextureId as it is not used by the shader so is optimized out.
        for (let i = 0; i < this._packedGeometryPoolSize; i++)
        {
            /* eslint-disable max-len */
            this._packedGeometries[i] = new (this.geometryClass)();
        }
    }

    /**
     * Handles the `prerender` signal.
     *
     * It ensures that flushes start from the first geometry
     * object again.
     */
    onPrerender()
    {
        this._flushId = 0;
    }

    /**
     * Buffers the "batchable" object. It need not be rendered
     * immediately.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when
     *    using this spritebatch
     * @override
     */
    render(element)
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
        this._bufferedElements[this._bufferSize++] = element;
    }

    /**
     * Renders the content and empties the current batch.
     *
     * @override
     */
    flush()
    {
        if (this._vertexCount === 0)
        {
            return;
        }

        const gl = this.renderer.gl;
        const attrBuffer = this.getAttributeBuffer(this._vertexCount);
        const indexBuffer = this.getIndexBuffer(this._indexCount);

        const {
            _bufferedElements: elements,
            _drawCalls: drawCalls,
            MAX_TEXTURES,
            _packedGeometries: packedGeometries,
            vertexSize,
        } = this;

        const {
            float32View, uint32View,
        } = attrBuffer;

        const touch = this.renderer.textureGC.count;
        let attrIndex = 0;
        let iIndex = 0;

        let nextTexture;
        let currentTexture;
        let textureCount = 0;

        let currentGroup = drawCalls[0];
        let groupCount = 0;

        let blendMode = -1;// premultiplyBlendMode[elements[0]._texture.baseTexture.premultiplyAlpha ? 0 : ][elements[0].blendMode];

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.blend = blendMode;

        let TICK = ++BaseTexture._globalBatch;
        let i;

        /* Interleaves and appends each object's geometry into the
           attribute buffer (`buffer`) and indices into `indexBuffer`. It
           also groups them into homogenous draw-calls. */
        for (i = 0; i < this._bufferSize; ++i)
        {
            const sprite = elements[i];

            elements[i] = null;
            nextTexture = sprite._texture.baseTexture;

            const spriteBlendMode = premultiplyBlendMode[
                nextTexture.premultiplyAlpha ? 1 : 0][sprite.blendMode];

            if (blendMode !== spriteBlendMode)
            { /* Must finish this group, since blend modes conflict. */
                blendMode = spriteBlendMode;
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture)
            {
                currentTexture = nextTexture;

                if (nextTexture._batchEnabled !== TICK)
                {
                    if (textureCount === MAX_TEXTURES)
                    {
                        TICK++;
                        textureCount = 0;
                        currentGroup.size = iIndex - currentGroup.start;

                        currentGroup = drawCalls[groupCount++];
                        currentGroup.textureCount = 0;
                        currentGroup.blend = blendMode;
                        currentGroup.start = iIndex;
                    }

                    nextTexture.touched = touch;
                    nextTexture._batchEnabled = TICK;
                    nextTexture._id = textureCount;

                    currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                    textureCount++;
                }
            }

            this.packInterleavedGeometry(sprite, float32View, uint32View,
                indexBuffer, attrIndex, iIndex);

            // push a graphics..
            attrIndex += (sprite.vertexData.length / 2) * vertexSize;
            iIndex += sprite.indices.length;
        }

        BaseTexture._globalBatch = TICK;
        currentGroup.size = iIndex - currentGroup.start;

        if (!settings.CAN_UPLOAD_SAME_BUFFER)// we must use new buffers
        {
            if (this._packedGeometryPoolSize <= this._flushId)
            {
                this._packedGeometryPoolSize++;// expand geometry pool
                this._packedGeometries[this._flushId] = new (this.geometryClass)();
            }

            packedGeometries[this._flushId]._buffer.update(
                attrBuffer.rawBinaryData, 0);
            packedGeometries[this._flushId]._indexBuffer.update(
                indexBuffer, 0);

            this.renderer.geometry.bind(packedGeometries[this._flushId]);
            this.renderer.geometry.updateBuffers();
            this._flushId++;
        }
        else
        {
            // lets use the faster option, always use buffer number 0
            packedGeometries[this._flushId]._buffer.update(
                attrBuffer.rawBinaryData, 0);
            packedGeometries[this._flushId]._indexBuffer.update(
                indexBuffer, 0);

            this.renderer.geometry.updateBuffers();
        }

        const textureSystem = this.renderer.texture;
        const stateSystem = this.renderer.state;

        for (i = 0; i < groupCount; i++)
        {
            const group = drawCalls[i];
            const groupTextureCount = group.textureCount;

            for (let j = 0; j < groupTextureCount; j++)
            {
                textureSystem.bind(group.textures[j], j);
                group.textures[j] = null;
            }

            stateSystem.setBlendMode(group.blend);
            gl.drawElements(group.type, group.size, gl.UNSIGNED_SHORT, group.start * 2);
        }

        // reset elements for the next flush
        this._bufferSize = 0;
        this._vertexCount = 0;
        this._indexCount = 0;
    }

    /**
     * Starts a new sprite batch.
     *
     * @override
     */
    start()
    {
        this.renderer.state.set(this.state);

        this.renderer.shader.bind(this._shader);

        if (settings.CAN_UPLOAD_SAME_BUFFER)
        {
            // bind buffer #0, we don't need others
            this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
        }
    }

    /**
     * Stops and flushes the current batch.
     *
     * @override
     */
    stop()
    {
        this.flush();
    }

    /**
     * Destroys this `BatchRenderer`. It cannot be used again.
     *
     * @override
     */
    destroy()
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
        this._drawCalls = null;

        if (this._shader)
        {
            this._shader.destroy();
            this._shader = null;
        }

        this.state = null;
        super.destroy();
    }

    /**
     * Fetches an attribute buffer from `this._aBuffers` that
     * can hold atleast `size` floats.
     *
     * @param {number} size - minimum capacity required
     * @return {BatchBuffer} - buffer than can hold atleast `size` floats
     * @private
     */
    getAttributeBuffer(size)
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
            this._aBuffers[roundedSize] = buffer = new BatchBuffer(roundedSize * this.vertexSize * 4);
        }

        return buffer;
    }

    /**
     * Fetches an index buffer from `this._iBuffers` that can
     * has atleast `size` capacity.
     *
     * @param {number} size - minimum required capacity
     * @return {Uint16Array} - buffer that can fit `size`
     *    indices.
     * @private
     */
    getIndexBuffer(size)
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
     * Takes all the attributes sources of the element being
     * drawn, interleaves them, and appends them to the
     * attribute buffer. It also appends the indices of the
     * element into the index buffer.
     *
     * @param {PIXI.Sprite} element - element being rendered
     * @param {Float32Array} float32View - float32-view of the attribute buffer
     * @param {Uint32Array} uint32View - uint32-view of the attribute buffer
     * @param {Uint16Array} indexBuffer - index buffer
     * @param {number} aIndex - number of floats already in the attribute buffer
     * @param {number} iIndex - number of indices already in `indexBuffer`
     */
    packInterleavedGeometry(element,
        float32View, uint32View, indexBuffer, aIndex, iIndex)
    {
        const packedVerticies = aIndex / this.vertexSize;
        const indicies = element.indices;
        const textureId = element._texture.baseTexture._id;

        const attributeDefinitions = this.attributeDefinitions;
        const attributeSources = [];
        let highestAttributeLength = 0;

        for (let i = 0; i < attributeDefinitions.length; i++)
        {
            const attribute = attributeDefinitions[i];

            if (typeof attributeDefinitions[i] !== 'string')
            {
                const source = element[attributeDefinitions[i].property];

                attributeSources.push(source);
                highestAttributeLength = Math.max(
                    highestAttributeLength, source.length / attribute.size);
            }
            else
            {
                switch (attributeDefinitions[i])
                {
                    case 'aColor':
                    {
                        const alpha = Math.min(element.worldAlpha, 1.0);
                        const argb = (alpha < 1.0
                        && element._texture.baseTexture.premultiplyAlpha)
                            ? premultiplyTint(element._tintRGB, alpha)
                            : element._tintRGB + (alpha * 255 << 24);

                        attributeSources.push([Math.round(argb)]);
                        highestAttributeLength
                            = Math.max(highestAttributeLength, 1);
                        break;
                    }
                    case 'aTextureId':
                    {
                        attributeSources.push(null);
                        break;
                    }
                    default:
                    {
                        throw new Error(`Unknown built-in attribute `
                          + `given to AbstractBatchRenderer: `
                          + `${attributeDefinitions[i]}`);
                    }
                }
            }
        }

        for (let d = 0; d < attributeDefinitions.length; d++)
        {
            attributeDefinitions[d].offset = 0;
        }

        for (let i = 0; i < highestAttributeLength; i++)
        {
            for (let s = 0; s < attributeSources.length; s++)
            {
                const attribute = attributeDefinitions[s];
                const source = attributeSources[s];

                if (!source)// Only aTextureId has no source!
                {
                    float32View[aIndex++] = textureId;
                    continue;
                }

                for (let float = 0; float < attribute.size; float++)
                {
                    float32View[aIndex++] = source[attribute.offset++ % source.length];
                }
            }
        }

        for (let i = 0; i < indicies.length; i++)
        {
            indexBuffer[iIndex++] = packedVerticies + indicies[i];
        }
    }

    /**
     * Calculates the vertex size for the given attribute
     * definitions. It also accounts for built-in attributes.
     *
     * @param {Array<Object>} attributeDefinitions - attribute definitions
     * @return sum of all attribute sizes
     */
    static vertexSizeOf(attributeDefinitions)
    {
        let vertexSize = 0;

        for (let d = 0; d < attributeDefinitions.length; d++)
        {
            const definition = attributeDefinitions[d];

            if (typeof definition !== 'string')
            {
                vertexSize += attributeDefinitions[d].size;
            }
            else
            {
                if (!builtinAttributeSizes[definition])
                {
                    throw new Error(`${definition} is not a builtin attribute!`);
                }

                vertexSize += builtinAttributeSizes[definition];
            }
        }

        return vertexSize;
    }
}
