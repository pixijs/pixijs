import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { RopeGeometry } from './RopeGeometry';

import type { PointData } from '../../maths/point/PointData';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Constructor options used for `MeshRope` instances. Allows configuration of a rope-like mesh
 * that follows a series of points with a texture applied.
 * @example
 * ```ts
 * // Create a basic rope with two points
 * const rope = new MeshRope({
 *     texture: Texture.from('snake.png'),
 *     points: [
 *         new Point(0, 0),
 *         new Point(100, 0)
 *     ]
 * });
 *
 * // Create a rope with high-quality texture scaling
 * const highQualityRope = new MeshRope({
 *     texture: Texture.from('rope-hd.png'),
 *     points: [
 *         new Point(0, 0),
 *         new Point(50, 25),
 *         new Point(100, 0)
 *     ],
 *     textureScale: 0.5  // Downscale HD texture for better quality
 * });
 * ```
 * @see {@link MeshRope} For the rope implementation
 * @see {@link RopeGeometry} For the underlying geometry
 * @category scene
 * @standard
 * @noInheritDoc
 */
export interface MeshRopeOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use on the rope */
    texture: Texture;

    /** An array of points that determine the rope's shape and path */
    points: PointData[];

    /**
     * Controls how the texture is scaled along the rope.
     * - If 0 (default), the texture stretches to fit between points
     * - If > 0, texture repeats with preserved aspect ratio
     * - Larger textures with textureScale < 1 can reduce artifacts
     * @default 0
     */
    textureScale?: number;
}

/**
 * A specialized mesh that renders a texture along a path defined by points. Perfect for
 * creating snake-like animations, chains, ropes, and other flowing objects.
 * @example
 * ```ts
 * // Create a snake with multiple segments
 * const points = [];
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * }
 *
 * const snake = new MeshRope({
 *     texture: Texture.from('snake.png'),
 *     points,
 *     textureScale: 0.5
 * });
 *
 * // Animate the snake
 * app.ticker.add((delta) => {
 *     const time = performance.now() / 1000;
 *
 *     // Update points to create wave motion
 *     for (let i = 0; i < points.length; i++) {
 *         points[i].y = Math.sin(i * 0.5 + time) * 30;
 *         points[i].x = (i * 50) + Math.cos(i * 0.3 + time) * 20;
 *     }
 * });
 *
 * // Disable auto updates if manually updating
 * snake.autoUpdate = false;
 * ```
 * @category scene
 * @standard
 */
export class MeshRope extends Mesh
{
    /**
     * Default options for creating a MeshRope instance. These values are used when specific
     * options aren't provided in the constructor.
     * @example
     * ```ts
     * // Use default options globally
     * MeshRope.defaultOptions = {
     *     textureScale: 0.5  // Set higher quality texture scaling
     * };
     *
     * // Create rope with modified defaults
     * const rope = new MeshRope({
     *     texture: Texture.from('rope.png'),
     *     points: [
     *         new Point(0, 0),
     *         new Point(100, 0)
     *     ]
     * }); // Will use textureScale: 0.5
     * ```
     * @property {number} textureScale - Controls texture scaling along the rope (0 = stretch)
     * @see {@link MeshRopeOptions} For all available options
     */
    public static defaultOptions: Partial<MeshRopeOptions> = {
        textureScale: 0,
    };

    /**
     * Controls whether the rope's vertices are automatically recalculated each frame based on
     * its points. When true, the rope will update to follow point movements. When false,
     * manual updates are required.
     * @example
     * ```ts
     * const points = [];
     * for (let i = 0; i < 20; i++) {
     *     points.push(new Point(i * 50, 0));
     * }
     *
     * const rope = new MeshRope({
     *     texture: Texture.from('rope.png'),
     *     points
     * });
     *
     * // Auto-update (default)
     * app.ticker.add(() => {
     *     // Points will automatically update the rope
     *     for (let i = 0; i < points.length; i++) {
     *         points[i].y = Math.sin(i * 0.5 + performance.now() / 1000) * 30;
     *     }
     * });
     *
     * // Manual update
     * rope.autoUpdate = false;
     * app.ticker.add(() => {
     *     // Update points
     *     for (let i = 0; i < points.length; i++) {
     *         points[i].y = Math.sin(i * 0.5 + performance.now() / 1000) * 30;
     *     }
     *     // Manually trigger update
     *     (rope.geometry as RopeGeometry).update();
     * });
     * ```
     * @default true
     * @see {@link RopeGeometry#update} For manual geometry updates
     */
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
