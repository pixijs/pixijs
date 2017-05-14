import WebGLSystem from '../WebGLSystem';
import { Rectangle, Matrix } from '../../../../math';
import VertexArrayObject from './VertexArrayObject';
import GLBuffer from './GLBuffer';
import setVertexAttribArrays from './setVertexAttribArrays';


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

        this._activeGeometry = null;
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
     */
    bind(geometry, glShader)
    {
        const gl = this.gl;

        // not sure the best way to address this..
        // currently different shaders require different VAOs for the same geometry
        // Still mulling over the best way to solve this one..
        // will likely need to modify the shader attribute locations at run time!
        let vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];

        if(!vaos)
        {
            vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID] = {};
        }

        const vao = vaos[glShader.id] || this.initGeometryVao(geometry, glShader);

        this._activeGeometry = geometry;

        if(this._activeVao !== vao)
        {
            this._activeVao = vao;
            gl.bindVertexArray(vao);
        }

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

    checkCompatability(geometry, glShader)
    {
        // geometry must have at least all the attributes that the shader requires.
        const geometryAttributes = geometry.attributes;
        const shaderAttributes = glShader.attributes;

        for (const j in shaderAttributes)
        {
            if(!geometryAttributes[j])
            {
                throw new Error('shader and geometry incompatible, geometry missing the "' + j + '" attribute');
            }
        }
    }

    /**
     * Creates a Vao with the same structure as the geometry and stores it on the geometry.
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to to generate Vao for
     * @return {PIXI.VertexArrayObject} Returns a fresh vao.
     */
    initGeometryVao(geometry, glShader)
    {
        this.checkCompatability(geometry, glShader);

        const gl = this.gl;
        const CONTEXT_UID = this.CONTEXT_UID;
        const buffers = geometry.buffers;
        const attributes = geometry.attributes;

        // first update - and create the buffers!
        for (let i = 0; i < buffers.length; i++)
        {
            const buffer = buffers[i];

            if (!buffer._glBuffers[CONTEXT_UID])
            {
                if (buffer.index)
                {
                    buffer._glBuffers[CONTEXT_UID] = GLBuffer.createIndexBuffer(gl, buffer.data);
                }
                else
                {
                    /* eslint-disable max-len */
                    buffer._glBuffers[CONTEXT_UID] = GLBuffer.createVertexBuffer(gl, buffer.data, buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
                }
            }
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
            if(!attributes[j].size && glShader.attributes[j])
            {
                attributes[j].size = glShader.attributes[j].size;
            }

            tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap[attributes[j].type];
        }

        for (const j in attributes)
        {
            const attribute = attributes[j];
            const attribSize = attribute.size;

            // must be careful that the geometry has attributes not used by this shader..

            if (attribute.stride === undefined)
            {
                if (tempStride[attribute.buffer] === attribSize * byteSizeMap[attribute.type])
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

                tempStart[attribute.buffer] += attribSize * byteSizeMap[attribute.type];
            }
        }

        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            geometry.indexBuffer._glBuffers[CONTEXT_UID].bind();
        }

        let lastBuffer = null;

        // add a new one!
        for (const j in attributes)
        {
            const attribute = attributes[j];
            const buffer = buffers[attribute.buffer];
            const glBuffer = buffer._glBuffers[CONTEXT_UID];

            if(glShader.attributes[j])
            {
                if(lastBuffer !== glBuffer)
                {
                    glBuffer.bind();
                    lastBuffer = glBuffer;
                }

                const location = glShader.attributes[j].location;

                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location,
                                       attribute.size,
                                       attribute.type || gl.FLOAT,
                                       attribute.normalized,
                                       attribute.stride,
                                       attribute.start);

                if(attribute.instance)
                {
                    gl.vertexAttribDivisor(location, 1);
                }
            }
        }

        geometry.glVertexArrayObjects[CONTEXT_UID][glShader.id] = vao;

        gl.bindVertexArray(null);

        return vao;
    }


    draw(type, size, start, instanceCount)
    {
        const gl = this.gl;
        const geometry = this._activeGeometry;

        //TODO.. this should not change so maybe cache the function?

        if(geometry.indexBuffer)
        {
            if(geometry.instanced)
            {
                gl.drawElementsInstanced(type, size || this.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
            }
            else
            {
                gl.drawElements(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2 );
            }
        }
        else
        {
            if(geometry.instanced)
            {
                // TODO need a better way to calculate size..
                gl.drawArrayInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
            }
            else
            {
                gl.drawArrays(type, start, size || geometry.getSize());
            }
        }

        return this;
    }

    /**
     * Creates a new VAO from this renderer's context and state.
     *
     * @return {VertexArrayObject} The new VAO.
     */
    createVao()
    {
        return new VertexArrayObject(this.gl, this.renderer.state.attribState);
    }

    /**
     * Changes the current Vao to the one given in parameter
     *
     * @param {PIXI.VertexArrayObject} vao - the new Vao
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    bindVao(vao)
    {
    }
}
