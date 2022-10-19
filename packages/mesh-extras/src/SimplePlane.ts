import { Texture } from '@pixi/core';
import { Mesh, MeshMaterial } from '@pixi/mesh';
import { PlaneGeometry } from './geometry/PlaneGeometry';

import type{ Renderer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';

/**
 * The SimplePlane allows you to draw a texture across several points and then manipulate these points
 * @example
 * import { Point, SimplePlane, Texture } from 'pixi.js';
 *
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * }
 * const SimplePlane = new SimplePlane(Texture.from('snake.png'), points);
 * @memberof PIXI
 */
export class SimplePlane extends Mesh
{
    /** The geometry is automatically updated when the texture size changes. */
    public autoResize: boolean;

    protected _textureID: number;

    /**
     * @param texture - The texture to use on the SimplePlane.
     * @param verticesX - The number of vertices in the x-axis
     * @param verticesY - The number of vertices in the y-axis
     */
    constructor(texture: Texture, verticesX?: number, verticesY?: number)
    {
        const planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
        const meshMaterial = new MeshMaterial(Texture.WHITE);

        super(planeGeometry, meshMaterial);

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
        this._textureID = this.shader.texture._updateID;

        const geometry: PlaneGeometry = this.geometry as any;
        const { width, height } = this.shader.texture;

        if (this.autoResize && (geometry.width !== width || geometry.height !== height))
        {
            geometry.width = this.shader.texture.width;
            geometry.height = this.shader.texture.height;
            geometry.build();
        }
    }

    set texture(value: Texture)
    {
        // Track texture same way sprite does.
        // For generated meshes like NineSlicePlane it can change the geometry.
        // Unfortunately, this method might not work if you directly change texture in material.

        if (this.shader.texture === value)
        {
            return;
        }

        this.shader.texture = value;
        this._textureID = -1;

        if (value.baseTexture.valid)
        {
            this.textureUpdated();
        }
        else
        {
            value.once('update', this.textureUpdated, this);
        }
    }

    get texture(): Texture
    {
        return this.shader.texture;
    }

    _render(renderer: Renderer): void
    {
        if (this._textureID !== this.shader.texture._updateID)
        {
            this.textureUpdated();
        }

        super._render(renderer);
    }

    public destroy(options?: IDestroyOptions | boolean): void
    {
        this.shader.texture.off('update', this.textureUpdated, this);
        super.destroy(options);
    }
}
