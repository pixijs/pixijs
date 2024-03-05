import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { PlaneGeometry } from './PlaneGeometry';

import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { DestroyOptions } from '../container/destroyTypes';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Constructor options used for `MeshPlane` instances.
 * ```js
 * const meshPlane = new MeshPlane({
 *    texture: Texture.from('snake.png'),
 *    verticesX: 20,
 *    verticesY: 20,
 * });
 * ```
 * @see {@link scene.MeshPlane}
 * @memberof scene
 */
export interface MeshPlaneOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use on the plane. */
    texture: Texture;
    /** The number of vertices in the x-axis */
    verticesX?: number;
    /** The number of vertices in the y-axis */
    verticesY?: number;
}

/**
 * The MeshPlane allows you to draw a texture across several points and then manipulate these points
 * @example
 * import { Point, MeshPlane, Texture } from 'pixi.js';
 *
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * }
 * const MeshPlane = new MeshPlane({ texture: Texture.from('snake.png'), verticesX: points });
 * @memberof scene
 */
export class MeshPlane extends Mesh
{
    /** The geometry is automatically updated when the texture size changes. */
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

    /** The texture of the MeshPlane */
    get texture(): Texture
    {
        return this._texture;
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public destroy(options?: DestroyOptions): void
    {
        this.texture.off('update', this.textureUpdated, this);
        super.destroy(options);
    }
}
