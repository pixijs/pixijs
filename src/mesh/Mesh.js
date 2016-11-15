import * as core from '../core';

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */
export default class Mesh extends core.Container
{
    /**
     * @param {PIXI.mesh.Geometry} geometry  the geometry the mesh will use
     * @param {PIXI.Shader} shader  the shader the mesh will use
     * @param {number} drawMode  the drawMode, can be any of the PIXI.DRAW_MODES consts
     */
    constructor(geometry, shader, drawMode = core.DRAW_MODES.TRIANGLES)
    {
        super();
        /**
         * the geometry the mesh will use
         * @type {PIXI.mesh.Geometry}
         */
        this.geometry = geometry;

        this.shader = shader;

        /**
         * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        this.blendMode = core.BLEND_MODES.NORMAL;

        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
         *
         * @member {number}
         * @see PIXI.mesh.Mesh.DRAW_MODES
         */
        this.drawMode = drawMode;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.WebGLRenderer} renderer a reference to the WebGL renderer
     * @private
     */
    _renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins.mesh);
        renderer.plugins.mesh.render(this);
    }

    /**
     * Calculates the bounds of the mesh. The bounds calculation takes the worldTransform into account.
     */
    _calculateBounds()
    {
        // The position property could be set manually?
        if (this.geometry.attributes.aVertexPosition)
        {
            const vertices = this.geometry.attributes.aVertexPosition.buffer.data;

            // TODO - we can cache local bounds and use them if they are dirty (like graphics)
            this._bounds.addVertices(this.transform, vertices, 0, vertices.length);
        }
    }

     /**
     * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
     *
     * @param point {PIXI.Point} the point to test
     * @return {boolean} the result of the test
     */

}
/**
 * Different drawing buffer modes supported
 *
 * @static
 * @constant
 * @property {object} DRAW_MODES
 * @property {number} DRAW_MODES.TRIANGLE_MESH
 * @property {number} DRAW_MODES.TRIANGLES
 */
Mesh.DRAW_MODES = {
    TRIANGLE_MESH: 1,
    TRIANGLES: 2,
    POINTS: 3,
};

