import { Mesh, MeshMaterial } from '@pixi/mesh';
import PlaneGeometry from './geometry/PlaneGeometry';

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let Plane = new PIXI.Plane(PIXI.Texture.from("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export default class SimplePlane extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the Plane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    constructor(texture, verticesX, verticesY)
    {
        const planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
        const meshMaterial = new MeshMaterial(texture);

        super(planeGeometry, meshMaterial);

        // wait for the texture to load
        if (!texture.baseTexture.hasLoaded)
        {
            texture.once('update', this.textureUpdated, this);
        }
    }

    textureUpdated()
    {
        this.geometry.width = this.shader.texture.width;
        this.geometry.height = this.shader.texture.height;

        this.geometry.build();
    }
}
