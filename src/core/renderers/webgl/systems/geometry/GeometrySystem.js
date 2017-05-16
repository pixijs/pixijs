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

        this.hasVao = true;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    contextChange()
    {
        const gl = this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        if(!gl.createVertexArray)
        {
            // webgl 1!
            const nativeVaoExtension = gl.getExtension('OES_vertex_array_object') ||
                                  gl.getExtension('MOZ_OES_vertex_array_object') ||
                                  gl.getExtension('WEBKIT_OES_vertex_array_object');

            if(nativeVaoExtension)
            {
                gl.createVertexArray = nativeVaoExtension.createVertexArrayOES;
                gl.bindVertexArray = nativeVaoExtension.bindVertexArrayOES;
                gl.deleteVertexArray = nativeVaoExtension.deleteVertexArrayOES;
            }
            else
            {
                this.hasVao = false;
                gl.createVertexArray = ()=>{return {}}
                gl.bindVertexArray = ()=>{}
                gl.deleteVertexArray = ()=>{}
            }
        }
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
     */
    bind(geometry, shader)
    {
        shader = shader || this.renderer.shader.shader;

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

        const vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program);

        this._activeGeometry = geometry;

        if(this._activeVao !== vao)
        {
            this._activeVao = vao;

            if(this.hasVao)
            {
                gl.bindVertexArray(vao);
            }
            else
            {
                this.activateVao(geometry, shader.program);
            }
        }

        // TODO - optimise later!
        // don't need to loop through if nothing changed!
        // maybe look to add an 'autoupdate' to geometry?
        this.updateBuffers();

    }


    updateBuffers()
    {
        const geometry = this._activeGeometry;
        const gl = this.gl;

        for (let i = 0; i < geometry.buffers.length; i++)
        {
            const buffer = geometry.buffers[i];

            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            if (buffer._updateID !== glBuffer._updateID)
            {
                glBuffer._updateID = buffer._updateID;

                // TODO can cache this on buffer! maybe added a getter / setter?
                const type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
                const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                gl.bindBuffer(type, glBuffer.buffer);

                if(glBuffer.byteLength >= buffer.data.byteLength)
                {
                    // offset is always zero for now!
                    gl.bufferSubData(type, 0, buffer.data);
                }
                else
                {
                    gl.bufferData(type, buffer.data, drawType);
                }

            }
        }
    }

    checkCompatability(geometry, program)
    {
        // geometry must have at least all the attributes that the shader requires.
        const geometryAttributes = geometry.attributes;
        const shaderAttributes = program.attributeData;

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
    initGeometryVao(geometry, program)
    {
        this.checkCompatability(geometry, program);

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
                buffer._glBuffers[CONTEXT_UID] = new GLBufferData(gl.createBuffer());
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
            if(!attributes[j].size && program.attributeData[j])
            {
                attributes[j].size = program.attributeData[j].size;
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

        // TODO - maybe make this a data object?
        // lets wait to see if we need to first!
        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        this.activateVao(geometry, program);

        gl.bindVertexArray(null);

        geometry.glVertexArrayObjects[CONTEXT_UID][program.id] = vao;

    }

    activateVao(geometry, program)
    {
        const gl = this.gl;
        const CONTEXT_UID = this.CONTEXT_UID;
        const buffers = geometry.buffers;
        const attributes = geometry.attributes;


        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
        }

        let lastBuffer = null;

        // add a new one!
        for (const j in attributes)
        {
            const attribute = attributes[j];
            const buffer = buffers[attribute.buffer];
            const glBuffer = buffer._glBuffers[CONTEXT_UID];

            if(program.attributeData[j])
            {
                if(lastBuffer !== glBuffer)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

                    lastBuffer = glBuffer;
                }

                const location = program.attributeData[j].location;

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
                gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
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

class GLBufferData
{
    constructor(buffer)
    {
        this.buffer = buffer;
        this.updateID = -1;
        this.byteLength = -1;
    }
}
