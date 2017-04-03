import WebGLSystem from './WebGLSystem';
import { Rectangle, Matrix } from '../../../math';
import glCore from 'pixi-gl-core';


const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

export default class GeometrySystem extends WebGLSystem
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this._activeVao = null;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    contextChange()
    {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
     * @param {PIXI.glCore.glShader} glShader shader that the geometry will be renderered with.
     */
    bind(geometry, glShader)
    {
        const vao = geometry.glVertexArrayObjects[this.CONTEXT_UID] || this.initGeometryVao(geometry, glShader);

        this.bindVao(vao);

        // TODO - optimise later!
        // don't need to loop through if nothing changed!
        // maybe look to add an 'autoupdate' to geometry?
        for (let i = 0; i < geometry.buffers.length; i++)
        {
            const buffer = geometry.buffers[i];

            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            if (buffer._updateID !== glBuffer._updateID)
            {
                glBuffer._updateID = buffer._updateID;
                // TODO - partial upload??
                glBuffer.upload(buffer.data, 0);
            }
        }
    }

    /**
     * Creates a Vao with the same structure as the geometry and stores it on the geometry.
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to to generate Vao for
     * @param {PIXI.glCore.glShader} glShader shader that the geometry will be renderered with.
     * @return {PIXI.glCore.VertexArrayObject} Returns a fresh vao.
     */
    initGeometryVao(geometry, glShader)
    {
        const gl = this.gl;

        this.bindVao(null);

        const vao = this.createVao();

        const buffers = geometry.buffers;
        const attributes = geometry.attributes;

        // first update - and create the buffers!
        for (let i = 0; i < buffers.length; i++)
        {
            const buffer = buffers[i];

            if (!buffer._glBuffers[this.CONTEXT_UID])
            {
                if (buffer.index)
                {
                    buffer._glBuffers[this.CONTEXT_UID] = glCore.GLBuffer.createIndexBuffer(gl, buffer.data);
                }
                else
                {
                    /* eslint-disable max-len */
                    buffer._glBuffers[this.CONTEXT_UID] = glCore.GLBuffer.createVertexBuffer(gl, buffer.data, buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
                }
            }
        }

        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            vao.addIndex(geometry.indexBuffer._glBuffers[this.CONTEXT_UID]);
        }

        const tempStride = {};
        const tempStart = {};

        for (const j in buffers)
        {
            tempStride[j] = 0;
            tempStart[j] = 0;
        }

        for (const j in attributes)
        {
            tempStride[attributes[j].buffer] += glShader.attributes[j].size * byteSizeMap[attributes[j].type];
        }

        for (const j in attributes)
        {
            const attribute = attributes[j];
            const glAttribute = glShader.attributes[j];

            if (attribute.stride === undefined)
            {
                if (tempStride[attribute.buffer] === glAttribute.size * byteSizeMap[attribute.type])
                {
                    attribute.stride = 0;
                }
                else
                {
                    attribute.stride = tempStride[attribute.buffer];
                }
            }

            if (attribute.start === undefined)
            {
                attribute.start = tempStart[attribute.buffer];

                tempStart[attribute.buffer] += glAttribute.size * byteSizeMap[attribute.type];
            }
        }

        // next update the attributes buffer..
        for (const j in attributes)
        {
            const attribute = attributes[j];
            const buffer = buffers[attribute.buffer];

            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            // need to know the shader as it means we can be lazy and let pixi do the work for us..
            // stride, start, type?
            vao.addAttribute(glBuffer,
                            glShader.attributes[j],
                            attribute.type || 5126, // (5126 = FLOAT)
                            attribute.normalized,
                            attribute.stride,
                            attribute.start,
                            attribute.instance);
        }

        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vao;

        return vao;
    }

    draw(type, size, start, instanceCount)
    {
    	this._activeVao.draw(type, size, start, instanceCount);
    }

    /**
     * Creates a new VAO from this renderer's context and state.
     *
     * @return {VertexArrayObject} The new VAO.
     */
    createVao()
    {
        return new glCore.VertexArrayObject(this.gl, this.renderer.state.attribState);
    }

    /**
     * Changes the current Vao to the one given in parameter
     *
     * @param {PIXI.VertexArrayObject} vao - the new Vao
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindVao(vao)
    {
        if (this._activeVao === vao)
        {
            return this;
        }

        if (vao)
        {
            vao.bind();
        }
        else if (this._activeVao)
        {
            // TODO this should always be true i think?
            this._activeVao.unbind();
        }

        this._activeVao = vao;

        return this;
    }
}
