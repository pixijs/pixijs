import { Color } from '../../../color';

import type { ColorSource } from '../../../color';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';

/**
 * Represents a particle with properties for position, scale, rotation, color, and texture.
 * @property {number} x - The x-coordinate of the particle.
 * @property {number} y - The y-coordinate of the particle.
 * @property {number} scaleX - The scale factor in the x-axis.
 * @property {number} scaleY - The scale factor in the y-axis.
 * @property {number} anchorX - The x-coordinate of the anchor point.
 * @property {number} anchorY - The y-coordinate of the anchor point.
 * @property {number} rotation - The rotation of the particle in radians.
 * @property {number} color - The color of the particle as a hexadecimal number.
 * @property {Texture} texture - The texture of the particle.
 */
export interface IParticle
{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    anchorX: number;
    anchorY: number;
    rotation: number;
    color: number;
    texture: Texture;
}

/**
 * Represents a single particle within a particle container. This class implements the IParticle interface,
 * providing properties and methods to manage the particle's position, scale, rotation, color, and texture.
 *
 * The reason we use a particle over a sprite is that these are much lighter weight and we can create a lot of them
 * without taking on the overhead of a full sprite.
 *
 * Here is an example of how to create a new particle:
 *
 * ```javascript
 * const particle = new Particle(texture);
 * particle.x = 100;
 * particle.y = 100;
 * particle.scaleX = 0.5;
 * particle.scaleY = 0.5;
 * particle.rotation = Math.PI / 2;
 * particle.color = 0xff0000;
 * ```
 * @implements {IParticle}
 */
export class Particle implements IParticle
{
    /** The x-coordinate of the anchor point. */
    public anchorX = 0;
    /** The y-coordinate of the anchor point. */
    public anchorY = 0;
    /** The x-coordinate of the particle. */
    public x = 0;
    /** The y-coordinate of the particle. */
    public y = 0;
    /** The scale factor in the x-axis. */
    public scaleX = 1;
    /** The scale factor in the y-axis. */
    public scaleY = 1;
    /** The rotation of the particle in radians. */
    public rotation = 0;
    /** The color of the particle as a hexadecimal number. */
    public color = 0xffffffff;
    /** The texture of the particle. */
    public texture: Texture;

    private _alpha = 1;
    private _tint = 0xffffff;

    constructor(texture: Texture)
    {
        this.texture = texture;
    }

    /** Gets or sets the alpha value of the particle. */
    get alpha(): number
    {
        return this._alpha;
    }

    set alpha(value: number)
    {
        this._alpha = Math.min(Math.max(value, 0), 1);

        this._updateColor();
    }

    /** Gets or sets the tint color of the particle. */
    get tint(): number
    {
        const bgr = this._tint;

        return ((bgr & 0xFF) << 16) + (bgr & 0xFF00) + ((bgr >> 16) & 0xFF);
    }

    set tint(value: ColorSource)
    {
        if (typeof value === 'number')
        {
            this._tint = value;
        }
        else
        {
            this._tint = Color.shared.setValue(value).toBgrNumber();
        }

        this._updateColor();
    }

    private _updateColor()
    {
        // combine alpha and tint
        this.color = this._tint + (((this._alpha * 255) | 0) << 24);
    }
}
