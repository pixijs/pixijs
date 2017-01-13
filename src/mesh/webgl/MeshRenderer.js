import * as core from '../../core';
import glCore from 'pixi-gl-core';

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class MeshRenderer extends core.ObjectRenderer {

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
        this.renderer.shaderManager.setUniforms(mesh.uniforms);

        // sync uniforms..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.bindGeometry(mesh.geometry, glShader);

        // then render it..
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode, mesh.size, mesh.start);
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
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
     * Creates a Vao with the same structure as the geometry and stores it on the geometry
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to to generate Vao for
     * @return {PIXI.glCore.VertexArrayObject} Returns a fresh vao.
     */
    initGeometryVao(geometry, glShader)
    {
        const gl = this.gl;

        this.renderer.bindVao(null);

        const vao = this.renderer.createVao();

        const buffers = geometry.buffers;
        const attributes = geometry.attributes;


        // first update - and creat the buffers!
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
                    buffer._glBuffers[this.CONTEXT_UID] = glCore.GLBuffer.createVertexBuffer(gl, buffer.data);
                }
            }
        }


        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            vao.addIndex(geometry.indexBuffer._glBuffers[this.CONTEXT_UID]);
        }

        var stride = 0;
        const tempStride = {};
        const tempStart = {};

        for(const j in buffers)
        {
            tempStride[buffers[j].id] = 0;
            tempStart[buffers[j].id] = 0;
        }

        for (const j in attributes)
        {
            // calculate stride..
            tempStride[attributes[j].buffer] += glShader.attributes[j].size;
            //assuming float for now!
        }

        let start = 0;


        console.log(buffers)
        console.log(attributes)

        // next update the attributes buffer..
        for (const j in attributes)
        {
            const attribute = attributes[j];
            const buffer = buffers[attribute.buffer];

            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            // need to know the shader as it means we can be lazy and let pixi do the work for us..
            // stride, start, type?
            vao.addAttribute(glBuffer, glShader.attributes[j], attribute.type || 5126, attribute.normalized, 0, 0)//, tempStride[attribute.buffer] * 4, tempStart[attribute.buffer] * 4);

            tempStart[attribute.buffer] += glShader.attributes[j].size
        }

        console.log(vao);

        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vao;

        return vao;
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
