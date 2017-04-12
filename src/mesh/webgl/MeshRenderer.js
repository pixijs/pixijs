import * as core from '../../core';

const byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };

const matrixIdentity = core.Matrix.IDENTITY;

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
    contextChange()
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
        const glShader = this.renderer.shader.bind(mesh.shader, true);

        // set the shader props..
        //if (glShader.uniformData.translationMatrix)
        //{
            // the transform!
          //  glShader.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        //}

        // set unifomrs..
        this.renderer.shader.syncUniformGroup(mesh.shader.uniformGroup);

        // sync uniforms..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.renderer.geometry.bind(mesh.geometry, glShader);
        // then render it
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode, mesh.size, mesh.start, mesh.geometry.instanceCount);
    }


    /**
     * draws mesh
     * @param {PIXI.mesh.RawMesh} mesh mesh instance
     */
    draw(mesh)
    {
        mesh.geometry.glVertexArrayObjects[this.CONTEXT_UID].draw(mesh.drawMode, mesh.size, mesh.start, mesh.geometry.instanceCount);
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
