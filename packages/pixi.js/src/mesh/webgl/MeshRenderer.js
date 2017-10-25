import * as core from '../../core';

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

        // TODO
        // set the shader props..
        // probably only need to set once!
        // as its then a refference..
        if (mesh.shader.program.uniformData.translationMatrix)
        {
            // the transform!
            mesh.shader.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        }

        // bind and sync uniforms..
        this.renderer.shader.bind(mesh.shader);

        // set state..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.renderer.geometry.bind(mesh.geometry, mesh.shader);
        // then render it
        this.renderer.geometry.draw(mesh.drawMode, mesh.size, mesh.start, mesh.geometry.instanceCount);
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
