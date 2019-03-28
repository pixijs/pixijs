import { Mesh, MeshMaterial } from '@pixi/mesh';
import { WRAP_MODES } from '@pixi/constants';
import RopeGeometry from './geometry/RopeGeometry';

/**
 * The tiling rope allows you to draw a texture that is distributed uniformly across several points
 * and then manipulate these points. If the rope is longer than the texture width,
 * its texture will be repeated, provided it is a power of two texture.
 * Also see {@link PIXI.SimpleRope}
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export default class TilingRope extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     * @param {number} textureScale - Optional. Scales rope texture while keeping its aspect ratio.
     * You can reduce alpha channel artifacts by providing a larger texture and downsampling here.
     */
    constructor(texture, points, textureScale = 1)
    {
        const ropeGeometry = new RopeGeometry(texture.height, points, false, textureScale);
        const meshMaterial = new MeshMaterial(texture);

        // attempt to set UV wrapping, will fail on non-power of two textures
        texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
        super(ropeGeometry, meshMaterial);

        /**
         * re-calculate vertices by rope points each frame
         *
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    _render(renderer)
    {
        if (this.autoUpdate
            || this.geometry.width !== this.shader.texture.height)
        {
            this.geometry.width = this.shader.texture.height;
            this.geometry.update();
        }

        super._render(renderer);
    }
}
