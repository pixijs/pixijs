import { Mesh, MeshMaterial } from '@pixi/mesh';
import { RopeGeometry } from './geometry/RopeGeometry';

/**
 * The rope allows you to draw a texture across several points and then manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.Rope(PIXI.Texture.from("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export class SimpleRope extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     */
    constructor(texture, points)
    {
        const ropeGeometry = new RopeGeometry(texture.height, points);
        const meshMaterial = new MeshMaterial(texture);

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
