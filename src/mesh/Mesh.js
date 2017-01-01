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
    constructor(geometry, shader, uniforms, state, drawMode = core.DRAW_MODES.TRIANGLES)
    {
        //drawMode = core.DRAW_MODES.TRIANGLES, uniforms = {})
        super();

        /**
         * the geometry the mesh will use
         * @type {PIXI.mesh.Geometry}
         */
        this.geometry = geometry;

        this.shader = shader;

        this.state = state || new core.State();

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
        this.drawMode = 4//drawMode;

        this.uniforms = uniforms;

//        geometry//
//        shader//
//        uniforms//
//        state//

        /**
         * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any
         * tint effect.
         *
         * @member {number}
         * @memberof PIXI.mesh.Mesh#
         */
        this.tintRgb = new Float32Array([1, 1, 1]);

        /**
         * A map of renderer IDs to webgl render data
         *
         * @private
         * @member {object<number, object>}
         */
        this._glDatas = {};

        /**
         * Plugin that is responsible for rendering this element.
         * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
         *
         * @member {string}
         * @default 'mesh'
         */
        this.pluginName = 'mesh';
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.WebGLRenderer} renderer a reference to the WebGL renderer
     * @private
     */
    _renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    _renderCanvas(renderer)
    {
        renderer.plugins[this.pluginName].render(this);
    }

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    _onTextureUpdate()
    {
        /* empty */
    }

    /**
     * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     *
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

