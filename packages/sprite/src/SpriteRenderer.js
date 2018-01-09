import { Geometry,
    Buffer,
    ObjectRenderer,
    checkMaxIfStatmentsInShader } from '@pixi/core';
import { settings } from '@pixi/settings';
import { createIndicesForQuads, premultiplyBlendMode, premultiplyTint } from '@pixi/utils';
import bitTwiddle from 'bit-twiddle';
import BatchBuffer from './BatchBuffer';
import generateMultiTextureShader from './generateMultiTextureShader';

let TICK = 0;
// const TEXTURE_TICK = 0;

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class SpriteRenderer extends ObjectRenderer
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this sprite batch works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * Number of values sent in the vertex buffer.
         * aVertexPosition(2), aTextureCoord(1), aColor(1), aTextureId(1) = 5
         *
         * @member {number}
         */
        this.vertSize = 5;

        /**
         * The size of the vertex information in bytes.
         *
         * @member {number}
         */
        this.vertByteSize = this.vertSize * 4;

        /**
         * The number of images in the SpriteRenderer before it flushes.
         *
         * @member {number}
         */
        this.size = settings.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

        // the total number of bytes in our batch
        // let numVerts = this.size * 4 * this.vertByteSize;

        this.buffers = [];
        for (let i = 1; i <= bitTwiddle.nextPow2(this.size); i *= 2)
        {
            this.buffers.push(new BatchBuffer(i * 4 * this.vertByteSize));
        }

        /**
         * Holds the indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         */
        this.indices = createIndicesForQuads(this.size);
        this.indexBuffer = new Buffer(this.indices, true, true);

        /**
         * The default shaders that is used if a sprite doesn't have a more specific one.
         * there is a shader for each number of textures that can be rendererd.
         * These shaders will also be generated on the fly as required.
         * @member {PIXI.Shader[]}
         */
        this.shader = null;

        this.currentIndex = 0;
        this.groups = [];

        for (let k = 0; k < this.size; k++)
        {
            this.groups[k] = { textures: [], textureCount: 0, ids: [], size: 0, start: 0, blend: 0 };
        }

        this.sprites = [];

        this.vertexBuffers = [];
        this.vaos = [];

        this.vaoMax = 2;
        this.vertexCount = 0;

        this.renderer.on('prerender', this.onPrerender, this);
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    contextChange()
    {
        const gl = this.renderer.gl;

        if (this.renderer.legacy)
        {
            this.MAX_TEXTURES = 1;
        }
        else
        {
            // step 1: first check max textures the GPU can handle.
            this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), settings.SPRITE_MAX_TEXTURES);

            // step 2: check the maximum number of if statements the shader can have too..
            this.MAX_TEXTURES = checkMaxIfStatmentsInShader(this.MAX_TEXTURES, gl);
        }

        // generate generateMultiTextureProgram, may be a better move?
        this.shader = generateMultiTextureShader(gl, this.MAX_TEXTURES);

        // we use the second shader as the first one depending on your browser may omit aTextureId
        // as it is not used by the shader so is optimized out.
        for (let i = 0; i < this.vaoMax; i++)
        {
            const buffer = new Buffer(null, false);

            /* eslint-disable max-len */
            this.vaos[i] = new Geometry()
                .addAttribute('aVertexPosition', buffer, 2, false, gl.FLOAT)
                .addAttribute('aTextureCoord', buffer, 2, true, gl.UNSIGNED_SHORT)
                .addAttribute('aColor', buffer, 4, true, gl.UNSIGNED_BYTE)
                .addAttribute('aTextureId', buffer, 1, true, gl.FLOAT)
                .addIndex(this.indexBuffer);
            /* eslint-enable max-len */

            this.vertexBuffers[i] = buffer;
        }
    }

    /**
     * Called before the renderer starts rendering.
     *
     */
    onPrerender()
    {
        this.vertexCount = 0;
    }

    /**
     * Renders the sprite object.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
     */
    render(sprite)
    {
        // TODO set blend modes..
        // check texture..
        if (this.currentIndex >= this.size)
        {
            this.flush();
        }

        // get the uvs for the texture

        // if the uvs have not updated then no point rendering just yet!
        if (!sprite._texture._uvs)
        {
            return;
        }

        // push a texture.
        // increment the batchsize
        this.sprites[this.currentIndex++] = sprite;
    }

    /**
     * Renders the content and empties the current batch.
     *
     */
    flush()
    {
        if (this.currentIndex === 0)
        {
            return;
        }

        const gl = this.renderer.gl;
        const MAX_TEXTURES = this.MAX_TEXTURES;

        const np2 = bitTwiddle.nextPow2(this.currentIndex);
        const log2 = bitTwiddle.log2(np2);
        const buffer = this.buffers[log2];

        const sprites = this.sprites;
        const groups = this.groups;

        const float32View = buffer.float32View;
        const uint32View = buffer.uint32View;

        const touch = this.renderer.textureGC.count;

        let index = 0;
        let nextTexture;
        let currentTexture;
        let groupCount = 1;
        let textureId = 0;
        let textureCount = 0;
        let currentGroup = groups[0];
        let vertexData;
        let uvs;
        let blendMode = premultiplyBlendMode[
            sprites[0]._texture.baseTexture.premultiplyAlpha ? 1 : 0][sprites[0].blendMode];

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.blend = blendMode;

        TICK++;

        let i;

        for (i = 0; i < this.currentIndex; ++i)
        {
            // upload the sprite elemetns...
            // they have all ready been calculated so we just need to push them into the buffer.

            const sprite = sprites[i];

            nextTexture = sprite._texture.baseTexture;
            textureId = nextTexture._id;

            const spriteBlendMode = premultiplyBlendMode[Number(nextTexture.premultiplyAlpha)][sprite.blendMode];

            if (blendMode !== spriteBlendMode)
            {
                blendMode = spriteBlendMode;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture)
            {
                currentTexture = nextTexture;

                if (nextTexture._enabled !== TICK)
                {
                    if (textureCount === MAX_TEXTURES)
                    {
                        TICK++;

                        textureCount = 0;

                        currentGroup.size = i - currentGroup.start;

                        currentGroup = groups[groupCount++];
                        currentGroup.textureCount = 0;
                        currentGroup.blend = blendMode;
                        currentGroup.start = i;
                    }

                    nextTexture.touched = touch;
                    nextTexture._enabled = TICK;
                    nextTexture._id = textureCount;

                    currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                    textureCount++;
                }
            }

            vertexData = sprite.vertexData;

            // TODO this sum does not need to be set each frame..
            uvs = sprite._texture._uvs.uvsUint32;
            textureId = nextTexture._id;

            if (this.renderer.roundPixels)
            {
                const resolution = this.renderer.resolution;

                // xy
                float32View[index] = ((vertexData[0] * resolution) | 0) / resolution;
                float32View[index + 1] = ((vertexData[1] * resolution) | 0) / resolution;

                // xy
                float32View[index + 5] = ((vertexData[2] * resolution) | 0) / resolution;
                float32View[index + 6] = ((vertexData[3] * resolution) | 0) / resolution;

                // xy
                float32View[index + 10] = ((vertexData[4] * resolution) | 0) / resolution;
                float32View[index + 11] = ((vertexData[5] * resolution) | 0) / resolution;

                // xy
                float32View[index + 15] = ((vertexData[6] * resolution) | 0) / resolution;
                float32View[index + 16] = ((vertexData[7] * resolution) | 0) / resolution;
            }
            else
            {
                // xy
                float32View[index] = vertexData[0];
                float32View[index + 1] = vertexData[1];

                // xy
                float32View[index + 5] = vertexData[2];
                float32View[index + 6] = vertexData[3];

                // xy
                float32View[index + 10] = vertexData[4];
                float32View[index + 11] = vertexData[5];

                // xy
                float32View[index + 15] = vertexData[6];
                float32View[index + 16] = vertexData[7];
            }

            uint32View[index + 2] = uvs[0];
            uint32View[index + 7] = uvs[1];
            uint32View[index + 12] = uvs[2];
            uint32View[index + 17] = uvs[3];
            /* eslint-disable max-len */
            const alpha = Math.min(sprite.worldAlpha, 1.0);
            const argb = alpha < 1.0 && nextTexture.premultiplyAlpha ? premultiplyTint(sprite._tintRGB, alpha)
                : sprite._tintRGB + (alpha * 255 << 24);

            uint32View[index + 3] = uint32View[index + 8] = uint32View[index + 13] = uint32View[index + 18] = argb;

            float32View[index + 4] = float32View[index + 9] = float32View[index + 14] = float32View[index + 19] = textureId;
            /* eslint-enable max-len */

            index += 20;
        }

        currentGroup.size = i - currentGroup.start;

        if (!settings.CAN_UPLOAD_SAME_BUFFER)
        {
            // this is still needed for IOS performance..
            // it really does not like uploading to the same buffer in a single frame!
            if (this.vaoMax <= this.vertexCount)
            {
                this.vaoMax++;

                const buffer = new Buffer(null, false);

                /* eslint-disable max-len */
                this.vaos[this.vertexCount] = new Geometry()
                    .addAttribute('aVertexPosition', buffer, 2, false, gl.FLOAT)
                    .addAttribute('aTextureCoord', buffer, 2, true, gl.UNSIGNED_SHORT)
                    .addAttribute('aColor', buffer, 4, true, gl.UNSIGNED_BYTE)
                    .addAttribute('aTextureId', buffer, 1, true, gl.FLOAT)
                    .addIndex(this.indexBuffer);
                /* eslint-enable max-len */

                this.vertexBuffers[this.vertexCount] = buffer;
            }

            this.vertexBuffers[this.vertexCount].update(buffer.vertices, 0);
            this.renderer.geometry.bind(this.vaos[this.vertexCount]);

            this.vertexCount++;
        }
        else
        {
            // lets use the faster option, always use buffer number 0
            this.vertexBuffers[this.vertexCount].update(buffer.vertices, 0);

            this.renderer.geometry.updateBuffers();
        }

        // / render the groups..
        for (i = 0; i < groupCount; i++)
        {
            const group = groups[i];
            const groupTextureCount = group.textureCount;

            for (let j = 0; j < groupTextureCount; j++)
            {
                this.renderer.texture.bind(group.textures[j], j);
            }

            // set the blend mode..
            this.renderer.state.setBlendMode(group.blend);

            gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
        }

        // reset elements for the next flush
        this.currentIndex = 0;
    }

    /**
     * Starts a new sprite batch.
     */
    start()
    {
        this.renderer.shader.bind(this.shader);

        if (settings.CAN_UPLOAD_SAME_BUFFER)
        {
            // bind buffer #0, we don't need others
            this.renderer.geometry.bind(this.vaos[this.vertexCount]);
        }
    }

    /**
     * Stops and flushes the current batch.
     *
     */
    stop()
    {
        this.flush();
    }

    /**
     * Destroys the SpriteRenderer.
     *
     */
    destroy()
    {
        for (let i = 0; i < this.vaoMax; i++)
        {
            if (this.vertexBuffers[i])
            {
                this.vertexBuffers[i].destroy();
            }
            if (this.vaos[i])
            {
                this.vaos[i].destroy();
            }
        }

        if (this.indexBuffer)
        {
            this.indexBuffer.destroy();
        }

        this.renderer.off('prerender', this.onPrerender, this);

        if (this.shader)
        {
            this.shader.destroy();
            this.shader = null;
        }

        this.vertexBuffers = null;
        this.vaos = null;
        this.indexBuffer = null;
        this.indices = null;

        this.sprites = null;

        for (let i = 0; i < this.buffers.length; ++i)
        {
            this.buffers[i].destroy();
        }

        super.destroy();
    }
}
