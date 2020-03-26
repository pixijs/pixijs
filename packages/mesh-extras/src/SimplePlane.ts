import { Texture, Renderer } from '@pixi/core';
import { Mesh, MeshMaterial } from '@pixi/mesh';
import { PlaneGeometry } from './geometry/PlaneGeometry';

/**
 * The SimplePlane allows you to draw a texture across several points and then manipulate these points
 *
 *```js
 * let plane = new PIXI.SimplePlane(PIXI.Texture.from("snake.png"));
 * let geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1], 2);
 * geometry.addIndex([0,1,2,1,3,2]);
 *
 * plane.geometry = geometry;
 *  ```
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 *
 */
export class SimplePlane extends Mesh
{
    protected _textureID: number;

    /**
     * @param {PIXI.Texture} texture - The texture to use on the SimplePlane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    constructor(texture: Texture, verticesX: number, verticesY: number)
    {
        const planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
        const meshMaterial = new MeshMaterial(Texture.WHITE);

        super(planeGeometry, meshMaterial);

        // lets call the setter to ensure all necessary updates are performed
        this.texture = texture;
    }

    /**
     * Method used for overrides, to do something in case texture frame was changed.
     * Meshes based on plane can override it and change more details based on texture.
     */
    public textureUpdated(): void
    {
        this._textureID = this.shader.texture._updateID;

        const geometry: PlaneGeometry = this.geometry as any;

        geometry.width = this.shader.texture.width;
        geometry.height = this.shader.texture.height;

        geometry.build();
    }

    set texture(value)
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
}
