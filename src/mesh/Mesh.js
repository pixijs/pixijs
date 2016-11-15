import * as core from '../core';

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 * @param texture {PIXI.Texture} The texture to use
 * @param [vertices] {Float32Array} if you want to specify the vertices
 * @param [uvs] {Float32Array} if you want to specify the uvs
 * @param [indices] {Uint16Array} if you want to specify the indices
 * @param [drawMode] {number} the drawMode, can be any of the Mesh.DRAW_MODES consts
 */
export default class Mesh extends core.Container
{

    constructor(geometry, shader, drawMode)
    {
        super();

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
         * Triangles in canvas mode are automatically antialiased, use this value to force triangles to overlap a bit with each other.
         *
         * @member {number}
         */

        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
         *
         * @member {number}
         * @see PIXI.mesh.Mesh.DRAW_MODES
         */
        this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param renderer {PIXI.WebGLRenderer} a reference to the WebGL renderer
     * @private
     */
    _renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins.mesh);
        renderer.plugins.mesh.render(this);
    }

    /**
     * Calculates the bounds of the mesh. The bounds calculation takes the worldTransform into account.
     *
     * @param [matrix=this.worldTransform] {PIXI.Matrix} the transformation matrix of the sprite
     * @return {PIXI.Rectangle} the framing rectangle
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

