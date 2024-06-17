import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { RopeGeometry } from './RopeGeometry';

import type { PointData } from '../../maths/point/PointData';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Constructor options used for `MeshRope` instances.
 * ```js
 * const meshRope = new MeshRope({
 *    texture: Texture.from('snake.png'),
 *    points: [new Point(0, 0), new Point(100, 0)],
 *    textureScale: 0,
 * });
 * ```
 * @see {@link scene.MeshRope}
 * @memberof scene
 */
export interface MeshRopeOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use on the rope. */
    texture: Texture;
    /** An array of points that determine the rope. */
    points: PointData[];
    /**
     * Rope texture scale, if zero then the rope texture is stretched.
     * Positive values scale rope texture
     * keeping its aspect ratio. You can reduce alpha channel artifacts by providing a larger texture
     * and downsampling here. If set to zero, texture will be stretched instead.
     */
    textureScale?: number;
}

/**
 * The rope allows you to draw a texture across several points and then manipulate these points
 * @example
 * import { Point, MeshRope, Texture } from 'pixi.js';
 *
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * };
 * const rope = new MeshRope(Texture.from('snake.png'), points);
 * @memberof scene
 */
export class MeshRope extends Mesh
{
    public static defaultOptions: Partial<MeshRopeOptions> = {
        textureScale: 0,
    };

    /** re-calculate vertices by rope points each frame */
    public autoUpdate: boolean;

    /**
     * Note: The wrap mode of the texture is set to REPEAT if `textureScale` is positive.
     * @param options
     * @param options.texture - The texture to use on the rope.
     * @param options.points - An array of {@link math.Point} objects to construct this rope.
     * @param {number} options.textureScale - Optional. Positive values scale rope texture
     * keeping its aspect ratio. You can reduce alpha channel artifacts by providing a larger texture
     * and downsampling here. If set to zero, texture will be stretched instead.
     */
    constructor(options: MeshRopeOptions)
    {
        const { texture, points, textureScale, ...rest } = { ...MeshRope.defaultOptions, ...options };
        const ropeGeometry = new RopeGeometry(definedProps({ width: texture.height, points, textureScale }));

        if (textureScale > 0)
        {
            // attempt to set UV wrapping, will fail on non-power of two textures
            texture.source.style.addressMode = 'repeat';
        }
        super(definedProps({
            ...rest,
            texture,
            geometry: ropeGeometry,
        }));

        this.autoUpdate = true;

        this.onRender = this._render;
    }

    private _render(): void
    {
        const geometry: RopeGeometry = this.geometry as any;

        if (this.autoUpdate || geometry._width !== this.texture.height)
        {
            geometry._width = this.texture.height;
            geometry.update();
        }
    }
}
