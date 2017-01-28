import * as core from '../../core';
import glCore from 'pixi-gl-core';

const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class MeshRenderer extends core.ObjectRenderer
{

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.shader = null;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    onContextChange()
    {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }

    /**
     * renders mesh
     * @private
     * @param {PIXI.mesh.RawMesh} mesh mesh instance
     */
    render(mesh)
    {
        // bind the shader..
        const glShader = this.renderer.shaderManager.bindShader(mesh.shader, true);

        // set the shader props..
        if (glShader.uniformData.translationMatrix)
        {
            // the transform!
            glShader.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        }

        // set unifomrs..
        this.renderer.shaderManager.setUniforms(mesh.shader.uniforms);

        // sync uniforms..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.bindGeometry(mesh.geometry, glShader);

        // then render it
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode, mesh.size, mesh.start);
    }

    /**
     * draws mesh
     * @param {PIXI.mesh.RawMesh} mesh mesh instance
     */
    draw(mesh)
    {
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode, mesh.size, mesh.start);
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
     * @param {PIXI.glCore.glShader} glShader shader that the geometry will be renderered with.
     */
    bindGeometry(geometry, glShader)
    {
        const vao = geometry.glVertexArrayObjects[this.CONTEXT_UID] || this.initGeometryVao(geometry, glShader);

        this.renderer.bindVao(vao);

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

        this.renderer.bindVao(null);

        const vao = this.renderer.createVao();

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
            if (tempStride[attributes[j].buffer] === glShader.attributes[j].size * byteSizeMap[attributes[j].type])
            {
                tempStride[attributes[j].buffer] = 0;
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
                            tempStride[attribute.buffer],
                            tempStart[attribute.buffer]);

            tempStart[attribute.buffer] += glShader.attributes[j].size * byteSizeMap[attribute.type];
        }

        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vao;

        return vao;
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
