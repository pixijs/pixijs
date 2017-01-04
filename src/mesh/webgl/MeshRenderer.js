import * as core from '../../core';
import glCore from 'pixi-gl-core';

/**
 * WebGL renderer plugin for tiling sprites
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
     * @param {PIXI.mesh.Mesh} mesh mesh instance
     */
    render(mesh)
    {
        // set the shader props..
        if (mesh.uniforms.translationMatrix)
        {
            // the transform!
            mesh.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        }

        // bind the shader..
        this.renderer.shaderManager.bindShader(mesh.shader, true);

        // set unifomrs..
        this.renderer.shaderManager.setUniforms(mesh.uniforms);

        // sync uniforms..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.bindGeometry(mesh.geometry);

        // then render it..
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode);
    }

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
     */
    bindGeometry(geometry)
    {
        const vao = geometry.glVertexArrayObjects[this.CONTEXT_UID] || this.initGeometryVao(geometry);

        this.renderer.bindVao(vao);
        const data = geometry.data;

        // TODO - optimise later!
        // don't need to loop through if nothing changed!
        // maybe look to add an 'autoupdate' to geometry?
        for (let i = 0; i < data.buffers.length; i++)
        {
            const buffer = data.buffers[i];

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
    initGeometryVao(geometry)
    {
        const gl = this.gl;

        this.renderer.bindVao(null);

        const vao = this.renderer.createVao();

        const buffers = geometry.data.buffers;

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

        // first update the index buffer..
        vao.addIndex(geometry.data.indexBuffer._glBuffers[this.CONTEXT_UID]);

        const map = geometry.style.generateAttributeLocations();

        // next update the attributes buffer..
        for (const j in geometry.style.attributes)
        {
            const attribute = geometry.style.attributes[j];
            const buffer = geometry.data[attribute.buffer];

            // need to know the shader..
            // or DO we... NOPE!
            const glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            vao.addAttribute(glBuffer, {
                size: attribute.size,
                location: map[j],
            }, gl.FLOAT, false, attribute.stride, attribute.start);
        }

        geometry.glVertexArrayObjects[this.CONTEXT_UID] = vao;

        return vao;
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
