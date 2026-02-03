import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { PlaneGeometry } from './PlaneGeometry';

import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { DestroyOptions } from '../container/destroyTypes';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Constructor options used for `MeshPlane` instances. Defines how a texture is mapped
 * onto a plane with configurable vertex density.
 * @example
 * ```ts
 * // Basic plane with default vertex density
 * const plane = new MeshPlane({
 *     texture: Assets.get('background.png')
 * });
 *
 * // High-detail plane for complex deformations
 * const detailedPlane = new MeshPlane({
 *     texture: Assets.get('landscape.jpg'),
 *     verticesX: 20,
 *     verticesY: 20
 * });
 * ```
 * @see {@link MeshPlane} For the mesh implementation
 * @see {@link PlaneGeometry} For the underlying geometry
 * @category scene
 * @standard
 * @noInheritDoc
 */
export interface MeshPlaneOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use on the plane. */
    texture: Texture;
    /**
     * Number of vertices along the X axis. More vertices allow for more detailed deformations.
     * @default 10
     */
    verticesX?: number;
    /**
     * Number of vertices along the Y axis. More vertices allow for more detailed deformations.
     * @default 10
     */
    verticesY?: number;
}

/**
 * A mesh that renders a texture mapped to a plane with configurable vertex density.
 * Useful for creating distortion effects, bent surfaces, and animated deformations.
 * @example
 * ```ts
 * // Create a basic plane
 * const plane = new MeshPlane({
 *     texture: Assets.get('background.png'),
 *     verticesX: 10,
 *     verticesY: 10
 * });
 *
 * // Get the buffer for vertex positions.
 * const { buffer } = plane.geometry.getAttribute('aPosition');
 *
 * // Listen for animate update
 * let timer = 0;
 *
 * app.ticker.add(() =>
 * {
 *     // Randomize the vertices positions a bit to create movement.
 *     for (let i = 0; i < buffer.data.length; i++)
 *     {
 *         buffer.data[i] += Math.sin(timer / 10 + i) * 0.5;
 *     }
 *     buffer.update();
 *     timer++;
 * });
 *
 * // Change texture dynamically
 * plane.texture = Assets.get('newTexture.png');
 * ```
 * @category scene
 * @standard
 */
export class MeshPlane extends Mesh
{
    /**
     * Controls whether the mesh geometry automatically updates when the texture dimensions change.
     * When true, the mesh will resize to match any texture updates. When false, the mesh maintains
     * its original dimensions regardless of texture changes.
     * @example
     * ```ts
     * // Create a plane that auto-resizes with texture changes
     * const plane = new MeshPlane({
     *     texture: Assets.get('small.png'),
     *     verticesX: 10,
     *     verticesY: 10
     * });
     *
     * // Plane will automatically resize to match new texture
     * plane.texture = Assets.get('large.png');
     *
     * // Disable auto-resizing to maintain original dimensions
     * plane.autoResize = false;
     *
     * // Plane keeps its size even with new texture
     * plane.texture = Assets.get('different.png');
     *
     * // Manually update geometry if needed
     * const geometry = plane.geometry as PlaneGeometry;
     * geometry.width = plane.texture.width;
     * geometry.height = plane.texture.height;
     * geometry.build();
     * ```
     * @default true
     * @see {@link MeshPlane#texture} For changing the texture
     * @see {@link PlaneGeometry} For manual geometry updates
     */
    public autoResize: boolean;
    protected _textureID: number;

    /**
     * @param options - Options to be applied to MeshPlane
     */
    constructor(options: MeshPlaneOptions)
    {
        const { texture, verticesX, verticesY, ...rest } = options;
        const planeGeometry = new PlaneGeometry(definedProps({
            width: texture.width,
            height: texture.height,
            verticesX,
            verticesY,
        }));

        super(definedProps({ ...rest, geometry: planeGeometry, texture }));

        // lets call the setter to ensure all necessary updates are performed
        this.texture = texture;
        this.autoResize = true;
    }

    /**
     * Method used for overrides, to do something in case texture frame was changed.
     * Meshes based on plane can override it and change more details based on texture.
     * @internal
     */
    public textureUpdated(): void
    {
        const geometry: PlaneGeometry = this.geometry as any;
        const { width, height } = this.texture;

        if (this.autoResize && (geometry.width !== width || geometry.height !== height))
        {
            geometry.width = width;
            geometry.height = height;
            geometry.build({});
        }
    }

    set texture(value: Texture)
    {
        this._texture?.off('update', this.textureUpdated, this);

        super.texture = value;

        value.on('update', this.textureUpdated, this);

        this.textureUpdated();
    }

    /**
     * The texture that the mesh plane uses for rendering. When changed, automatically updates
     * geometry dimensions if autoResize is true and manages texture update event listeners.
     * @example
     * ```ts
     * const plane = new MeshPlane({
     *     texture: Assets.get('initial.png'),
     *     verticesX: 10,
     *     verticesY: 10
     * });
     *
     * // Update texture and auto-resize geometry
     * plane.texture = Assets.get('larger.png');
     * ```
     * @see {@link MeshPlane#autoResize} For controlling automatic geometry updates
     * @see {@link PlaneGeometry} For manual geometry updates
     * @see {@link Texture} For texture creation and management
     */
    get texture(): Texture
    {
        return this._texture;
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @example
     * meshPlane.destroy();
     * meshPlane.destroy(true);
     * meshPlane.destroy({ texture: true, textureSource: true });
     */
    public destroy(options?: DestroyOptions): void
    {
        this.texture.off('update', this.textureUpdated, this);
        super.destroy(options);
    }
}
