import * as core from '../core';

const tempPoint = new core.Point();
const tempPolygon = new core.Polygon();

/**
 * Base mesh class.
 * The reason for this class is to empower you to have maximum flexbilty to render any kind of webGL you can think of.
 * This class assumes a certain level of webGL knowledge.
 * If you know a bit this should abstract enough away to make you life easier!
 * Pretty much ALL WebGL can be broken down into the following:
 * Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
 * Shader - This is the shader that pixi will render the geometry with. (attributes in the shader must match the geometry!)
 * Uniforms - These are the values passed to the shader when the mesh is rendered.
 * As a shader can be resued accross multiple objects, it made sense to allow uniforms to exist outside of the shader
 * State - This is the state of WebGL required to render the mesh.
 * Through a combination of the above elements you can render anything you want, 2D or 3D!
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */
export default class RawMesh extends core.Container
{
    /**
     * @param {PIXI.mesh.Geometry} geometry  the geometry the mesh will use
     * @param {PIXI.Shader} shader  the shader the mesh will use
     * @param {Object} uniforms the uniform values that this mesh will specifically use
     * (will automatically be generated of not supplied)
     * @param {PIXI.State} state  the state that the webGL context is required to be in to render the mesh
     * @param {number} drawMode  the drawMode, can be any of the PIXI.DRAW_MODES consts
     */
    constructor(geometry, shader, uniforms, state, drawMode = core.DRAW_MODES.TRIANGLES)
    {
        super();

        /**
         * the geometry the mesh will use
         * @type {PIXI.mesh.Geometry}
         */
        this.geometry = geometry;

        /**
         * the shader the mesh will use
         * @type {PIXI.Shader}
         */
        this.shader = shader;

        /**
         * the webGL state the mesh requires to render
         * @type {PIXI.State}
         */
        this.state = state || new core.State();

        /**
         * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        this.blendMode = core.BLEND_MODES.NORMAL;
        this.state.blendMode = this.blendMode;

        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.RawMesh.DRAW_MODES} consts
         *
         * @member {number}
         * @see PIXI.mesh.RawMesh.DRAW_MODES
         */
        this.drawMode = drawMode;

        uniforms = uniforms || {};

        // make sure to add required feilds
        // if the user misses any uniforms we can add the default valujes from the shader
        for (const i in shader.uniforms)
        {
            if (uniforms[i] === undefined)
            {
                uniforms[i] = shader.uniforms[i];
            }
        }

        /**
         * The way uniforms that will be used by the mesh's shader.
         * @member {Object}
         */
        this.uniforms = uniforms;

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

        this.start = 0;
        this.size = 0;
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
     * Updates the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     * there must be a aVertexPosition attribute present in the geometry for bounds to be calcualted correctly.
     *
     * @private
     */
    _calculateBounds()
    {
        // The position property could be set manually?
        if (this.geometry.style.attributes.aVertexPosition)
        {
            const vertices = this.geometry.getAttribute('aVertexPosition').data;

            // TODO - we can cache local bounds and use them if they are dirty (like graphics)
            this._bounds.addVertices(this.transform, vertices, 0, vertices.length);
        }
    }

    /**
     * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
     *
     * @param {PIXI.Point} point the point to test
     * @return {boolean} the result of the test
     */
    containsPoint(point)
    {
        if (!this.getBounds().contains(point.x, point.y))
        {
            return false;
        }

        this.worldTransform.applyInverse(point, tempPoint);

        const vertices = this.geometry.getAttribute('aVertexPosition').data;

        const points = tempPolygon.points;
        const indices =  this.geometry.getIndex().data;
        const len = indices.length;
        const step = this.drawMode === 4 ? 3 : 1;

        for (let i = 0; i + 2 < len; i += step)
        {
            const ind0 = indices[i] * 2;
            const ind1 = indices[i + 1] * 2;
            const ind2 = indices[i + 2] * 2;

            points[0] = vertices[ind0];
            points[1] = vertices[ind0 + 1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1 + 1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2 + 1];

            if (tempPolygon.contains(tempPoint.x, tempPoint.y))
            {
                return true;
            }
        }

        return false;
    }
}
