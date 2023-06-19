import { Color, extensions, ExtensionType, Matrix, ObjectRenderer, Shader, State, TYPES, utils } from '@pixi/core';
import { ParticleBuffer } from './ParticleBuffer';
import fragment from './particles.frag';
import vertex from './particles.vert';

import type { ExtensionMetadata, Renderer } from '@pixi/core';
import type { Sprite } from '@pixi/sprite';
import type { ParticleContainer } from './ParticleContainer';

export interface IParticleRendererProperty
{
    attributeName: string;
    size: number;
    type?: TYPES;
    uploadFunction: (...params: any[]) => any;
    offset: number;
}

/*
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original PixiJS version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now
 * share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 * Renderer for Particles that is designer for speed over feature set.
 * @memberof PIXI
 */
export class ParticleRenderer extends ObjectRenderer
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'particle',
        type: ExtensionType.RendererPlugin,
    };

    /** The WebGL state in which this renderer will work. */
    public readonly state: State;

    /** The default shader that is used if a sprite doesn't have a more specific one. */
    public shader: Shader;
    public tempMatrix: Matrix;
    public properties: IParticleRendererProperty[];

    /**
     * @param renderer - The renderer this sprite batch works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        // 65535 is max vertex index in the index buffer (see ParticleRenderer)
        // so max number of particles is 65536 / 4 = 16384
        // and max number of element in the index buffer is 16384 * 6 = 98304
        // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
        // let numIndices = 98304;

        this.shader = null;

        this.properties = null;

        this.tempMatrix = new Matrix();

        this.properties = [
            // verticesData
            {
                attributeName: 'aVertexPosition',
                size: 2,
                uploadFunction: this.uploadVertices,
                offset: 0,
            },
            // positionData
            {
                attributeName: 'aPositionCoord',
                size: 2,
                uploadFunction: this.uploadPosition,
                offset: 0,
            },
            // rotationData
            {
                attributeName: 'aRotation',
                size: 1,
                uploadFunction: this.uploadRotation,
                offset: 0,
            },
            // uvsData
            {
                attributeName: 'aTextureCoord',
                size: 2,
                uploadFunction: this.uploadUvs,
                offset: 0,
            },
            // tintData
            {
                attributeName: 'aColor',
                size: 1,
                type: TYPES.UNSIGNED_BYTE,
                uploadFunction: this.uploadTint,
                offset: 0,
            },
        ];

        this.shader = Shader.from(vertex, fragment, {});
        this.state = State.for2d();
    }

    /**
     * Renders the particle container object.
     * @param container - The container to render using this ParticleRenderer.
     */
    public render(container: ParticleContainer): void
    {
        const children = container.children;
        const maxSize = container._maxSize;
        const batchSize = container._batchSize;
        const renderer = this.renderer;
        let totalChildren = children.length;

        if (totalChildren === 0)
        {
            return;
        }
        else if (totalChildren > maxSize && !container.autoResize)
        {
            totalChildren = maxSize;
        }

        let buffers = container._buffers;

        if (!buffers)
        {
            buffers = container._buffers = this.generateBuffers(container);
        }

        const baseTexture = children[0]._texture.baseTexture;
        const premultiplied = baseTexture.alphaMode > 0;

        // if the uvs have not updated then no point rendering just yet!
        this.state.blendMode = utils.correctBlendMode(container.blendMode, premultiplied);
        renderer.state.set(this.state);

        const gl = renderer.gl;

        const m = container.worldTransform.copyTo(this.tempMatrix);

        m.prepend(renderer.globalUniforms.uniforms.projectionMatrix);

        this.shader.uniforms.translationMatrix = m.toArray(true);

        this.shader.uniforms.uColor = Color.shared
            .setValue(container.tintRgb)
            .premultiply(container.worldAlpha, premultiplied)
            .toArray(this.shader.uniforms.uColor);

        this.shader.uniforms.uSampler = baseTexture;

        this.renderer.shader.bind(this.shader);

        let updateStatic = false;

        // now lets upload and render the buffers..
        for (let i = 0, j = 0; i < totalChildren; i += batchSize, j += 1)
        {
            let amount = (totalChildren - i);

            if (amount > batchSize)
            {
                amount = batchSize;
            }

            if (j >= buffers.length)
            {
                buffers.push(this._generateOneMoreBuffer(container));
            }

            const buffer = buffers[j];

            // we always upload the dynamic
            buffer.uploadDynamic(children, i, amount);

            const bid = container._bufferUpdateIDs[j] || 0;

            updateStatic = updateStatic || (buffer._updateID < bid);
            // we only upload the static content when we have to!
            if (updateStatic)
            {
                buffer._updateID = container._updateID;
                buffer.uploadStatic(children, i, amount);
            }

            // bind the buffer
            renderer.geometry.bind(buffer.geometry);
            gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Creates one particle buffer for each child in the container we want to render and updates internal properties.
     * @param container - The container to render using this ParticleRenderer
     * @returns - The buffers
     */
    private generateBuffers(container: ParticleContainer): ParticleBuffer[]
    {
        const buffers = [];
        const size = container._maxSize;
        const batchSize = container._batchSize;
        const dynamicPropertyFlags = container._properties;

        for (let i = 0; i < size; i += batchSize)
        {
            buffers.push(new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize));
        }

        return buffers;
    }

    /**
     * Creates one more particle buffer, because container has autoResize feature.
     * @param container - The container to render using this ParticleRenderer
     * @returns - The generated buffer
     */
    private _generateOneMoreBuffer(container: ParticleContainer): ParticleBuffer
    {
        const batchSize = container._batchSize;
        const dynamicPropertyFlags = container._properties;

        return new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize);
    }

    /**
     * Uploads the vertices.
     * @param children - the array of sprites to render
     * @param startIndex - the index to start from in the children array
     * @param amount - the amount of children that will have their vertices uploaded
     * @param array - The vertices to upload.
     * @param stride - Stride to use for iteration.
     * @param offset - Offset to start at.
     */
    public uploadVertices(
        children: Sprite[], startIndex: number, amount: number,
        array: number[], stride: number, offset: number
    ): void
    {
        let w0 = 0;
        let w1 = 0;
        let h0 = 0;
        let h1 = 0;

        for (let i = 0; i < amount; ++i)
        {
            const sprite = children[startIndex + i];
            const texture = sprite._texture;
            const sx = sprite.scale.x;
            const sy = sprite.scale.y;
            const trim = texture.trim;
            const orig = texture.orig;

            if (trim)
            {
                // if the sprite is trimmed and is not a tilingsprite then we need to add the
                // extra space before transforming the sprite coords..
                w1 = trim.x - (sprite.anchor.x * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (sprite.anchor.y * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w0 = (orig.width) * (1 - sprite.anchor.x);
                w1 = (orig.width) * -sprite.anchor.x;

                h0 = orig.height * (1 - sprite.anchor.y);
                h1 = orig.height * -sprite.anchor.y;
            }

            array[offset] = w1 * sx;
            array[offset + 1] = h1 * sy;

            array[offset + stride] = w0 * sx;
            array[offset + stride + 1] = h1 * sy;

            array[offset + (stride * 2)] = w0 * sx;
            array[offset + (stride * 2) + 1] = h0 * sy;

            array[offset + (stride * 3)] = w1 * sx;
            array[offset + (stride * 3) + 1] = h0 * sy;

            offset += stride * 4;
        }
    }

    /**
     * Uploads the position.
     * @param children - the array of sprites to render
     * @param startIndex - the index to start from in the children array
     * @param amount - the amount of children that will have their positions uploaded
     * @param array - The vertices to upload.
     * @param stride - Stride to use for iteration.
     * @param offset - Offset to start at.
     */
    public uploadPosition(
        children: Sprite[], startIndex: number, amount: number,
        array: number[], stride: number, offset: number
    ): void
    {
        for (let i = 0; i < amount; i++)
        {
            const spritePosition = children[startIndex + i].position;

            array[offset] = spritePosition.x;
            array[offset + 1] = spritePosition.y;

            array[offset + stride] = spritePosition.x;
            array[offset + stride + 1] = spritePosition.y;

            array[offset + (stride * 2)] = spritePosition.x;
            array[offset + (stride * 2) + 1] = spritePosition.y;

            array[offset + (stride * 3)] = spritePosition.x;
            array[offset + (stride * 3) + 1] = spritePosition.y;

            offset += stride * 4;
        }
    }

    /**
     * Uploads the rotation.
     * @param children - the array of sprites to render
     * @param startIndex - the index to start from in the children array
     * @param amount - the amount of children that will have their rotation uploaded
     * @param array - The vertices to upload.
     * @param stride - Stride to use for iteration.
     * @param offset - Offset to start at.
     */
    public uploadRotation(
        children: Sprite[], startIndex: number, amount: number,
        array: number[], stride: number, offset: number
    ): void
    {
        for (let i = 0; i < amount; i++)
        {
            const spriteRotation = children[startIndex + i].rotation;

            array[offset] = spriteRotation;
            array[offset + stride] = spriteRotation;
            array[offset + (stride * 2)] = spriteRotation;
            array[offset + (stride * 3)] = spriteRotation;

            offset += stride * 4;
        }
    }

    /**
     * Uploads the UVs.
     * @param children - the array of sprites to render
     * @param startIndex - the index to start from in the children array
     * @param amount - the amount of children that will have their rotation uploaded
     * @param array - The vertices to upload.
     * @param stride - Stride to use for iteration.
     * @param offset - Offset to start at.
     */
    public uploadUvs(
        children: Sprite[], startIndex: number, amount: number,
        array: number[], stride: number, offset: number
    ): void
    {
        for (let i = 0; i < amount; ++i)
        {
            const textureUvs = children[startIndex + i]._texture._uvs;

            if (textureUvs)
            {
                array[offset] = textureUvs.x0;
                array[offset + 1] = textureUvs.y0;

                array[offset + stride] = textureUvs.x1;
                array[offset + stride + 1] = textureUvs.y1;

                array[offset + (stride * 2)] = textureUvs.x2;
                array[offset + (stride * 2) + 1] = textureUvs.y2;

                array[offset + (stride * 3)] = textureUvs.x3;
                array[offset + (stride * 3) + 1] = textureUvs.y3;

                offset += stride * 4;
            }
            else
            {
                // TODO you know this can be easier!
                array[offset] = 0;
                array[offset + 1] = 0;

                array[offset + stride] = 0;
                array[offset + stride + 1] = 0;

                array[offset + (stride * 2)] = 0;
                array[offset + (stride * 2) + 1] = 0;

                array[offset + (stride * 3)] = 0;
                array[offset + (stride * 3) + 1] = 0;

                offset += stride * 4;
            }
        }
    }

    /**
     * Uploads the tint.
     * @param children - the array of sprites to render
     * @param startIndex - the index to start from in the children array
     * @param amount - the amount of children that will have their rotation uploaded
     * @param array - The vertices to upload.
     * @param stride - Stride to use for iteration.
     * @param offset - Offset to start at.
     */
    public uploadTint(
        children: Sprite[], startIndex: number, amount: number,
        array: number[], stride: number, offset: number
    ): void
    {
        for (let i = 0; i < amount; ++i)
        {
            const sprite = children[startIndex + i];
            const result = Color.shared
                .setValue(sprite._tintRGB)
                .toPremultiplied(sprite.alpha, sprite.texture.baseTexture.alphaMode > 0);

            array[offset] = result;
            array[offset + stride] = result;
            array[offset + (stride * 2)] = result;
            array[offset + (stride * 3)] = result;

            offset += stride * 4;
        }
    }

    /** Destroys the ParticleRenderer. */
    public destroy(): void
    {
        super.destroy();

        if (this.shader)
        {
            this.shader.destroy();
            this.shader = null;
        }

        this.tempMatrix = null;
    }
}

extensions.add(ParticleRenderer);
