import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';
import { getGlInfoFromFormat } from './utils/getGlInfoFromFormat';

import type { Topology } from '../../shared/geometry/const';
import type { Geometry } from '../../shared/geometry/Geometry';
import type { System } from '../../shared/system/System';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { GlProgram } from '../shader/GlProgram';
import type { WebGLRenderer } from '../WebGLRenderer';

const byteSizeMap: {[key: number]: number} = { 5126: 4, 5123: 2, 5121: 1 };

const topologyToGlMap = {
    'point-list': 0x0000,
    'line-list': 0x0001,
    'line-strip': 0x0003,
    'triangle-list': 0x0004,
    'triangle-strip': 0x0005
};

/** System plugin to the renderer to manage geometry. */
export class GlGeometrySystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'geometry',
    } as const;

    /**
     * `true` if we has `*_vertex_array_object` extension.
     * @readonly
     */
    public hasVao: boolean;

    /**
     * `true` if has `ANGLE_instanced_arrays` extension.
     * @readonly
     */
    public hasInstance: boolean;

    /**
     * `true` if support `gl.UNSIGNED_INT` in `gl.drawElements` or `gl.drawElementsInstanced`.
     * @readonly
     */
    public canUseUInt32ElementIndex: boolean;

    protected gl: GlRenderingContext;
    protected _activeGeometry: Geometry;
    protected _activeVao: WebGLVertexArrayObject;

    protected _geometryVaoHash: Record<number, Record<string, WebGLVertexArrayObject>> = {};

    /** Renderer that owns this {@link GeometrySystem}. */
    private _renderer: WebGLRenderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
        this._activeGeometry = null;
        this._activeVao = null;

        this.hasVao = true;
        this.hasInstance = true;
        this.canUseUInt32ElementIndex = true;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        this.gl = this._renderer.gl;
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @param geometry - Instance of geometry to bind.
     * @param program - Instance of program to use vao for.
     */
    public bind(geometry?: Geometry, program?: GlProgram): void
    {
        // shader = shader || this.renderer.shader.shader;

        const gl = this.gl;

        this._activeGeometry = geometry;

        const vao = this.getVao(geometry, program);

        if (this._activeVao !== vao)
        {
            this._activeVao = vao;

            gl.bindVertexArray(vao);
        }

        this.updateBuffers();
    }

    /** Reset and unbind any active VAO and geometry. */
    public reset(): void
    {
        this.unbind();
    }

    /** Update buffers of the currently bound geometry. */
    public updateBuffers(): void
    {
        const geometry = this._activeGeometry;

        const bufferSystem = this._renderer.buffer;

        for (let i = 0; i < geometry.buffers.length; i++)
        {
            const buffer = geometry.buffers[i];

            bufferSystem.updateBuffer(buffer);
        }
    }

    /**
     * Check compatibility between a geometry and a program
     * @param geometry - Geometry instance.
     * @param program - Program instance.
     */
    protected checkCompatibility(geometry: Geometry, program: GlProgram): void
    {
        // geometry must have at least all the attributes that the shader requires.
        const geometryAttributes = geometry.attributes;
        const shaderAttributes = program._attributeData;

        for (const j in shaderAttributes)
        {
            if (!geometryAttributes[j])
            {
                throw new Error(`shader and geometry incompatible, geometry missing the "${j}" attribute`);
            }
        }
    }

    /**
     * Takes a geometry and program and generates a unique signature for them.
     * @param geometry - To get signature from.
     * @param program - To test geometry against.
     * @returns - Unique signature of the geometry and program
     */
    protected getSignature(geometry: Geometry, program: GlProgram): string
    {
        const attribs = geometry.attributes;
        const shaderAttributes = program._attributeData;

        const strings = ['g', geometry.uid];

        for (const i in attribs)
        {
            if (shaderAttributes[i])
            {
                strings.push(i, shaderAttributes[i].location);
            }
        }

        return strings.join('-');
    }

    protected getVao(geometry: Geometry, program: GlProgram): WebGLVertexArrayObject
    {
        return this._geometryVaoHash[geometry.uid]?.[program._key] || this.initGeometryVao(geometry, program);
    }

    /**
     * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
     * If vao is created, it is bound automatically. We use a shader to infer what and how to set up the
     * attribute locations.
     * @param geometry - Instance of geometry to to generate Vao for.
     * @param program
     * @param _incRefCount - Increment refCount of all geometry buffers.
     */
    protected initGeometryVao(geometry: Geometry, program: GlProgram, _incRefCount = true): WebGLVertexArrayObject
    {
        const gl = this._renderer.gl;
        // const CONTEXT_UID = this.CONTEXT_UID;
        const bufferSystem = this._renderer.buffer;

        this._renderer.shader._getProgramData(program);

        this.checkCompatibility(geometry, program);

        const signature = this.getSignature(geometry, program);

        if (!this._geometryVaoHash[geometry.uid])
        {
            this._geometryVaoHash[geometry.uid] = Object.create(null);

            geometry.on('destroy', this.onGeometryDestroy, this);
        }

        const vaoObjectHash = this._geometryVaoHash[geometry.uid];

        let vao = vaoObjectHash[signature];

        if (vao)
        {
            // this will give us easy access to the vao
            vaoObjectHash[program._key] = vao;

            return vao;
        }

        const buffers = geometry.buffers;
        const attributes = geometry.attributes;
        const tempStride: Record<string, number> = {};
        const tempStart: Record<string, number> = {};

        for (const j in buffers)
        {
            tempStride[j] = 0;
            tempStart[j] = 0;
        }

        for (const j in attributes)
        {
            if (!attributes[j].size && program._attributeData[j])
            {
                attributes[j].size = program._attributeData[j].size;
            }
            else if (!attributes[j].size)
            {
                // #if _DEBUG
                warn(`PIXI Geometry attribute '${j}' size cannot be determined (likely the bound shader does not have the attribute)`);  // eslint-disable-line
                // #endif
            }

            tempStride[attributes[j].buffer.uid] += attributes[j].size * byteSizeMap[attributes[j].type];
        }

        for (const j in attributes)
        {
            const attribute = attributes[j];
            const attribSize = attribute.size;

            if (attribute.stride === undefined)
            {
                if (tempStride[attribute.buffer.uid] === attribSize * byteSizeMap[attribute.type])
                {
                    attribute.stride = 0;
                }
                else
                {
                    attribute.stride = tempStride[attribute.buffer.uid];
                }
            }

            if (attribute.start === undefined)
            {
                attribute.start = tempStart[attribute.buffer.uid];

                tempStart[attribute.buffer.uid] += attribSize * byteSizeMap[attribute.type];
            }
        }

        // @TODO: We don't know if VAO is supported.
        vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        // first update - and create the buffers!
        // only create a gl buffer if it actually gets
        for (let i = 0; i < buffers.length; i++)
        {
            const buffer = buffers[i];

            bufferSystem.bind(buffer);
        }

        // TODO - maybe make this a data object?
        // lets wait to see if we need to first!

        this.activateVao(geometry, program);

        // add it to the cache!
        vaoObjectHash[program._key] = vao;
        vaoObjectHash[signature] = vao;

        gl.bindVertexArray(null);

        return vao;
    }

    /**
     * Disposes geometry.
     * @param geometry - Geometry with buffers. Only VAO will be disposed
     * @param [contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    protected onGeometryDestroy(geometry: Geometry, contextLost?: boolean): void
    {
        const vaoObjectHash = this._geometryVaoHash[geometry.uid];

        const gl = this.gl;

        if (vaoObjectHash)
        {
            if (contextLost)
            {
                for (const i in vaoObjectHash)
                {
                    if (this._activeVao !== vaoObjectHash[i])
                    {
                        this.unbind();
                    }

                    gl.deleteVertexArray(vaoObjectHash[i]);
                }
            }

            this._geometryVaoHash[geometry.uid] = null;
        }
    }

    /**
     * Dispose all WebGL resources of all managed geometries.
     * @param [contextLost=false] - If context was lost, we suppress `gl.delete` calls
     */
    public destroyAll(contextLost = false): void
    {
        const gl = this.gl;

        for (const i in this._geometryVaoHash)
        {
            if (contextLost)
            {
                for (const j in this._geometryVaoHash[i])
                {
                    const vaoObjectHash = this._geometryVaoHash[i];

                    if (this._activeVao !== vaoObjectHash)
                    {
                        this.unbind();
                    }

                    gl.deleteVertexArray(vaoObjectHash[j]);
                }
            }

            this._geometryVaoHash[i] = null;
        }
    }

    /**
     * Activate vertex array object.
     * @param geometry - Geometry instance.
     * @param program - Shader program instance.
     */
    protected activateVao(geometry: Geometry, program: GlProgram): void
    {
        const gl = this._renderer.gl;

        const bufferSystem = this._renderer.buffer;
        const attributes = geometry.attributes;

        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            bufferSystem.bind(geometry.indexBuffer);
        }

        let lastBuffer = null;

        // add a new one!
        for (const j in attributes)
        {
            const attribute = attributes[j];
            const buffer = attribute.buffer;
            const glBuffer = bufferSystem.getGlBuffer(buffer);

            if (program._attributeData[j])
            {
                if (lastBuffer !== glBuffer)
                {
                    bufferSystem.bind(buffer);

                    lastBuffer = glBuffer;
                }

                const location = program._attributeData[j].location;

                // TODO introduce state again
                // we can optimise this for older devices that have no VAOs
                gl.enableVertexAttribArray(location);

                const glInfo = getGlInfoFromFormat(attribute.format);

                gl.vertexAttribPointer(location,
                    glInfo.size,
                    glInfo.type, // attribute.type || gl.FLOAT,
                    glInfo.normalised,
                    attribute.stride,
                    attribute.offset);

                if (attribute.instance)
                {
                    // TODO calculate instance count based of this...
                    if (this.hasInstance)
                    {
                        gl.vertexAttribDivisor(location, 1);// attribute.divisor);
                    }
                    else
                    {
                        throw new Error('geometry error, GPU Instancing is not supported on this device');
                    }
                }
            }
        }
    }

    /**
     * Draws the currently bound geometry.
     * @param topology - The type primitive to render.
     * @param size - The number of elements to be rendered. If not specified, all vertices after the
     *  starting vertex will be drawn.
     * @param start - The starting vertex in the geometry to start drawing from. If not specified,
     *  drawing will start from the first vertex.
     * @param instanceCount - The number of instances of the set of elements to execute. If not specified,
     *  all instances will be drawn.
     */
    public draw(topology?: Topology, size?: number, start?: number, instanceCount?: number): this
    {
        const { gl } = this._renderer;
        const geometry = this._activeGeometry;

        const glTopology = topologyToGlMap[geometry.topology || topology];

        if (geometry.indexBuffer)
        {
            const byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT;
            const glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

            if (geometry.instanced)
            {
                /* eslint-disable max-len */
                gl.drawElementsInstanced(glTopology, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, geometry.instanceCount || 1);
                /* eslint-enable max-len */
            }
            else
            {
                /* eslint-disable max-len */
                gl.drawElements(glTopology, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize);
                /* eslint-enable max-len */
            }
        }
        else if (geometry.instanced)
        {
            // TODO need a better way to calculate size..
            gl.drawArraysInstanced(glTopology, start, size || geometry.getSize(), instanceCount || 1);
        }
        else
        {
            gl.drawArrays(glTopology, start, size || geometry.getSize());
        }

        return this;
    }

    /** Unbind/reset everything. */
    protected unbind(): void
    {
        this.gl.bindVertexArray(null);
        this._activeVao = null;
        this._activeGeometry = null;
    }

    public destroy(): void
    {
        this._renderer = null;
        this.gl = null;
        this._activeVao = null;
        this._activeGeometry = null;
    }
}
