import { WRAP_MODES } from '@pixi/core';
import { Mesh, MeshMaterial } from '@pixi/mesh';
import { RopeGeometry } from './geometry/RopeGeometry';

import type { IPoint, Renderer, Texture } from '@pixi/core';

/**
 * The rope allows you to draw a texture across several points and then manipulate these points
 * @example
 * import { Point, SimpleRope, Texture } from 'pixi.js';
 *
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * };
 * const rope = new SimpleRope(Texture.from('snake.png'), points);
 * @memberof PIXI
 */
export class SimpleRope extends Mesh
{
    public autoUpdate: boolean;

    /**
     * Note: The wrap mode of the texture is set to REPEAT if `textureScale` is positive.
     * @param texture - The texture to use on the rope.
     * @param points - An array of {@link PIXI.Point} objects to construct this rope.
     * @param {number} textureScale - Optional. Positive values scale rope texture
     * keeping its aspect ratio. You can reduce alpha channel artifacts by providing a larger texture
     * and downsampling here. If set to zero, texture will be stretched instead.
     */
    constructor(texture: Texture, points: IPoint[], textureScale = 0)
    {
        const ropeGeometry = new RopeGeometry(texture.height, points, textureScale);
        const meshMaterial = new MeshMaterial(texture);

        if (textureScale > 0)
        {
            // attempt to set UV wrapping, will fail on non-power of two textures
            texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
        }
        super(ropeGeometry, meshMaterial);

        /**
         * re-calculate vertices by rope points each frame
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    _render(renderer: Renderer): void
    {
        const geometry: RopeGeometry = this.geometry as any;

        if (this.autoUpdate || geometry._width !== this.shader.texture.height)
        {
            geometry._width = this.shader.texture.height;
            geometry.update();
        }

        super._render(renderer);
    }
}
