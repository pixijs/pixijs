import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { PerspectivePlaneGeometry } from './PerspectivePlaneGeometry';

import type { MeshPlaneOptions } from '../mesh-plane/MeshPlane';

/**
 * Constructor options used for `PerspectiveMesh` instances. Defines the geometry and appearance
 * of a 2D mesh with perspective projection.
 * @example
 * ```ts
 * // Create a perspective mesh with a texture
 * const mesh = new PerspectiveMesh({
 *     texture: Texture.from('myImage.png'),
 *     verticesX: 20,
 *     verticesY: 20,
 *     // Define corners clockwise from top-left
 *     x0: 0,   y0: 0,    // Top-left
 *     x1: 100, y1: 20,   // Top-right (raised)
 *     x2: 100, y2: 100,  // Bottom-right
 *     x3: 0,   y3: 80    // Bottom-left (raised)
 * });
 *
 * // Create a skewed perspective
 * const skewedMesh = new PerspectiveMesh({
 *     texture: Texture.from('background.jpg'),
 *     verticesX: 15,     // More vertices for smoother perspective
 *     verticesY: 15,
 *     x0: 0,   y0: 30,   // Shifted top-left
 *     x1: 128, y1: 0,    // Raised top-right
 *     x2: 128, y2: 128,  // Normal bottom-right
 *     x3: 0,   y3: 98    // Shifted bottom-left
 * });
 * ```
 * @extends MeshPlaneOptions
 * @see {@link PerspectiveMesh} For the mesh implementation
 * @see {@link PerspectivePlaneGeometry} For the underlying geometry
 * @category scene
 * @standard
 * @noInheritDoc
 */
export interface PerspectivePlaneOptions extends MeshPlaneOptions
{
    /** The x-coordinate of the top-left corner */
    x0?: number,
    /** The y-coordinate of the top-left corner */
    y0?: number,
    /** The x-coordinate of the top-right corner */
    x1?: number,
    /** The y-coordinate of the top-right corner */
    y1?: number,
    /** The x-coordinate of the bottom-right corner */
    x2?: number,
    /** The y-coordinate of the bottom-right corner */
    y2?: number,
    /** The x-coordinate of the bottom-left corner */
    x3?: number,
    /** The y-coordinate of the bottom-left corner */
    y3?: number
}

/**
 * A perspective mesh that allows you to draw a 2d plane with perspective. Where ever you move the corners
 * the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.
 *
 * The calculations is done at the uv level. This means that the more vertices you have the more smooth
 * the perspective will be. If you have a low amount of vertices you may see the texture stretch. Too many vertices
 * could be slower. It is a balance between performance and quality! We leave that to you to decide.
 *
 * > [!IMPORTANT] This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it.
 * @category scene
 * @standard
 * @see {@link PerspectiveMesh}
 * @example
 * ```ts
 * // Create a perspective mesh with a texture
 * const mesh = new PerspectiveMesh({
 *     texture: Texture.from('myImage.png'),
 *     verticesX: 20,
 *     verticesY: 20,
 *     // Define corners clockwise from top-left
 *     x0: 0,   y0: 0,    // Top-left
 *     x1: 100, y1: 20,   // Top-right (raised)
 *     x2: 100, y2: 100,  // Bottom-right
 *     x3: 0,   y3: 80    // Bottom-left (raised)
 * });
 * ```
 */
export class PerspectiveMesh extends Mesh<PerspectivePlaneGeometry>
{
    /**
     * Default options for creating a PerspectiveMesh instance.
     *
     * Creates a 100x100 pixel square mesh
     * with a white texture and 10x10 vertex grid for the perspective calculations.
     * @example
     * ```ts
     * // Change defaults globally
     * PerspectiveMesh.defaultOptions = {
     *     ...PerspectiveMesh.defaultOptions,
     *     verticesX: 15,
     *     verticesY: 15,
     *     // Move top edge up for default skew
     *     y0: -20,
     *     y1: -20
     * };
     * ```
     * @see {@link PerspectivePlaneOptions} For all available options
     * @see {@link PerspectivePlaneGeometry} For how vertices affect perspective quality
     */
    public static defaultOptions: PerspectivePlaneOptions = {
        texture: Texture.WHITE,
        verticesX: 10,
        verticesY: 10,
        x0: 0,
        y0: 0,
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 100,
        x3: 0,
        y3: 100
    };

    /**
     * @param options - Options to be applied to PerspectiveMesh
     */
    constructor(options: PerspectivePlaneOptions)
    {
        options = { ...PerspectiveMesh.defaultOptions, ...options };

        const { texture, verticesX, verticesY, ...rest } = options;
        const planeGeometry = new PerspectivePlaneGeometry(definedProps({
            width: texture.width,
            height: texture.height,
            verticesX,
            verticesY,
        }));

        super(definedProps({ ...rest, geometry: planeGeometry }));

        this._texture = texture;

        this.geometry.setCorners(
            options.x0, options.y0,
            options.x1, options.y1,
            options.x2, options.y2,
            options.x3, options.y3
        );
    }

    /** Update the geometry when the texture is updated */
    protected textureUpdated(): void
    {
        const geometry: PerspectivePlaneGeometry = this.geometry as any;

        if (!geometry) return;

        const { width, height } = this.texture;

        if (geometry.width !== width || geometry.height !== height)
        {
            geometry.width = width;
            geometry.height = height;
            geometry.updateProjection();
        }
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        super.texture = value;

        this.textureUpdated();
    }

    /**
     * The texture that the mesh uses for rendering. When changed, automatically updates
     * the geometry to match the new texture dimensions.
     * @example
     * ```ts
     * const mesh = new PerspectiveMesh({
     *     texture: Texture.from('initial.png'),
     * });
     *
     * // Update texture and maintain perspective
     * mesh.texture = Texture.from('newImage.png');
     * ```
     * @see {@link Texture} For texture creation and management
     * @see {@link PerspectiveMesh#setCorners} For adjusting the mesh perspective
     */
    get texture(): Texture
    {
        return this._texture;
    }

    /**
     * Sets the corners of the mesh to create a perspective transformation. The corners should be
     * specified in clockwise order starting from the top-left.
     *
     * The mesh automatically recalculates the UV coordinates to create the perspective effect.
     * @example
     * ```ts
     * const mesh = new PerspectiveMesh({
     *     texture: Texture.from('myImage.png'),
     * });
     *
     * // Create a basic perspective tilt
     * mesh.setCorners(
     *     0, 0,      // Top-left
     *     100, 20,   // Top-right (raised)
     *     100, 100,  // Bottom-right
     *     0, 80      // Bottom-left
     * );
     *
     * // Create a skewed billboard effect
     * mesh.setCorners(
     *     0, 30,     // Top-left (shifted down)
     *     128, 0,    // Top-right (raised)
     *     128, 128,  // Bottom-right
     *     0, 98      // Bottom-left (shifted up)
     * );
     *
     * // Animate perspective
     * app.ticker.add((delta) => {
     *     const time = performance.now() / 1000;
     *     const wave = Math.sin(time) * 20;
     *
     *     mesh.setCorners(
     *         0, wave,      // Top-left
     *         100, -wave,   // Top-right
     *         100, 100,     // Bottom-right
     *         0, 100        // Bottom-left
     *     );
     * });
     * ```
     * @param x0 - x-coordinate of the top-left corner
     * @param y0 - y-coordinate of the top-left corner
     * @param x1 - x-coordinate of the top-right corner
     * @param y1 - y-coordinate of the top-right corner
     * @param x2 - x-coordinate of the bottom-right corner
     * @param y2 - y-coordinate of the bottom-right corner
     * @param x3 - x-coordinate of the bottom-left corner
     * @param y3 - y-coordinate of the bottom-left corner
     * @returns The PerspectiveMesh instance for method chaining
     * @see {@link PerspectivePlaneGeometry} For the underlying geometry calculations
     */
    public setCorners(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number)
    {
        this.geometry.setCorners(x0, y0, x1, y1, x2, y2, x3, y3);
    }
}
