import WebGLSystem from '../WebGLSystem';
import GLBuffer from './GLBuffer';

const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
export default class GeometrySystem extends WebGLSystem
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this._activeGeometry = null;
        this._activeVao = null;

        this.hasVao = true;
        this.hasInstance = true;
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

        // webgl2
        if (!gl.createVertexArray)
        {
            // webgl 1!
            let nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;

            if (this.renderer.legacy)
            {
                nativeVaoExtension = null;
            }

            if (nativeVaoExtension)
            {
                gl.createVertexArray = () =>
                    nativeVaoExtension.createVertexArrayOES();

                gl.bindVertexArray = (vao) =>
                    nativeVaoExtension.bindVertexArrayOES(vao);

                gl.deleteVertexArray = (vao) =>
                    nativeVaoExtension.deleteVertexArrayOES(vao);
            }
            else
            {
                this.hasVao = false;
                gl.createVertexArray = () =>
                {
                    // empty
                };

                gl.bindVertexArray = () =>
                {
                    // empty
                };

                gl.deleteVertexArray = () =>
                {
                    // empty
                };
            }
        }

        if (!gl.vertexAttribDivisor)
        {
            const instanceExt = gl.getExtension('ANGLE_instanced_arrays');

            if (instanceExt)
            {
                gl.vertexAttribDivisor = (a, b) =>
                    instanceExt.vertexAttribDivisorANGLE(a, b);

                gl.drawElementsInstanced = (a, b, c, d, e) =>
                    instanceExt.drawElementsInstancedANGLE(a, b, c, d, e);

                gl.drawArraysInstanced = (a, b, c, d) =>
                    instanceExt.drawArraysInstancedANGLE(a, b, c, d);
            }
            else
            {
                this.hasInstance = false;
            }
        }
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.Geometry} geometry instance of geometry to bind
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

        if (!vaos)
        {
            geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
        }

        const vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program);

        this._activeGeometry = geometry;

        if (this._activeVao !== vao)
        {
            this._activeVao = vao;

            if (this.hasVao)
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

    reset()
    {
        this.unbind();
    }

    updateBuffers()
    {
        const geometry = this._activeGeometry;
        const gl = this.gl;

        for (let i = 0; i < geometry.buffers.length; i++)
        {
            const buffer = geometry.buffers[i];

            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            if (buffer._updateID !== glBuffer.updateID)
            {
                glBuffer.updateID = buffer._updateID;

                // TODO can cache this on buffer! maybe added a getter / setter?
                const type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
                const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                gl.bindBuffer(type, glBuffer.buffer);

                if (glBuffer.byteLength >= buffer.data.byteLength)
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
            if (!geometryAttributes[j])
            {
                throw new Error(`shader and geometry incompatible, geometry missing the "${j}" attribute`);
            }
        }
    }

    /**
     * Creates a Vao with the same structure as the geometry and stores it on the geometry.
     * @private
     * @param {PIXI.Geometry} geometry instance of geometry to to generate Vao for
     */
    initGeometryVao(geometry, program)
    {
        this.checkCompatability(geometry, program);

        const gl = this.gl;
        const CONTEXT_UID = this.CONTEXT_UID;
        const buffers = geometry.buffers;
        const attributes = geometry.attributes;

        const tempStride = {};
        const tempStart = {};

        for (const j in buffers)
        {
            tempStride[j] = 0;
            tempStart[j] = 0;
        }

        for (const j in attributes)
        {
            if (!attributes[j].size && program.attributeData[j])
            {
                attributes[j].size = program.attributeData[j].size;
            }

            tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap[attributes[j].type];
        }

        for (const j in attributes)
        {
            const attribute = attributes[j];
            const attribSize = attribute.size;

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

        // first update - and create the buffers!
        // only create a gl buffer if it actually gets
        for (let i = 0; i < buffers.length; i++)
        {
            const buffer = buffers[i];

            if (!buffer._glBuffers[CONTEXT_UID])
            {
                buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());
            }
        }

        // TODO - maybe make this a data object?
        // lets wait to see if we need to first!
        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        this.activateVao(geometry, program);

        gl.bindVertexArray(null);

        // add it to the cache!
        geometry.glVertexArrayObjects[this.CONTEXT_UID][program.id] = vao;

        return vao;
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

            if (program.attributeData[j])
            {
                if (lastBuffer !== glBuffer)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

                    lastBuffer = glBuffer;
                }

                const location = program.attributeData[j].location;

                // TODO introduce state again
                // we can optimise this for older devices that have no VAOs
                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location,
                    attribute.size,
                    attribute.type || gl.FLOAT,
                    attribute.normalized,
                    attribute.stride,
                    attribute.start);

                if (attribute.instance)
                {
                    // TODO calculate instance count based of this...
                    if (this.hasInstance)
                    {
                        gl.vertexAttribDivisor(location, 1);
                    }
                    else
                    {
                        throw new Error('geometry error, GPU Instancing is not supported on this device');
                    }
                }
            }
        }
    }

    draw(type, size, start, instanceCount)
    {
        const gl = this.gl;
        const geometry = this._activeGeometry;

        // TODO.. this should not change so maybe cache the function?

        if (geometry.indexBuffer)
        {
            if (geometry.instanced)
            {
                /* eslint-disable max-len */
                gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
                /* eslint-enable max-len */
            }
            else
            {
                gl.drawElements(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2);
            }
        }
        else
        if (geometry.instanced)
        {
            // TODO need a better way to calculate size..
            gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
        }
        else
        {
            gl.drawArrays(type, start, size || geometry.getSize());
        }

        return this;
    }

    unbind()
    {
        this.gl.bindVertexArray(null);
        this._activeVao = null;
        this._activeGeometry = null;
    }
}
