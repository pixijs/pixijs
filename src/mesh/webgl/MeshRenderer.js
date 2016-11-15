import * as core from '../../core';
import glCore from 'pixi-gl-core';
import { default as Mesh } from '../Mesh';

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

        //nothing to see here!
    }

    /**
     * renders mesh
     *
     * @param {PIXI.mesh.Mesh} mesh mesh instance
     */
    render(mesh)
    {
        // get rid of any thing that may be batching.
//        renderer.flush();

        // always use shaders - rather than GLShadr

        // generate geometry structure from a shader :)

        // set the shader props..
        if (mesh.shader.uniforms.translationMatrix)
        {
            // the transform!
            mesh.shader.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        }

          // set the correct blend mode
        renderer.state.setBlendMode(mesh.blendMode);

        // bind the shader..
        // TODO rename filter to shader
        renderer.bindShader(mesh.shader);

        // now time for geometry..

        // bind the geometry...
        this.bindGeometry(mesh.geometry);

        // then render it..
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw( mesh.drawMode );
    }

    bindGeometry(geometry)
    {
        const vao = geometry.glVertexArrayObjects[this.CONTEXT_UID] || this.initGeometryVao(geometry);

        this.renderer.bindVao(vao);

        if (geometry.autoUpdate)
        {
            // TODO - optimise later!
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
    }

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
