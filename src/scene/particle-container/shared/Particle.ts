import { Color } from '../../../color/Color';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { bgr2rgb } from '../../container/container-mixins/getGlobalMixin';
import { assignWithIgnore } from '../../container/utils/assignWithIgnore';

import type { ColorSource } from '../../../color/Color';

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
 * @memberof scene
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
 * Represents the options for creating a new particle.
 * @property {number} x - The x-coordinate of the particle.
 * @property {number} y - The y-coordinate of the particle.
 * @property {number} scaleX - The scale factor in the x-axis.
 * @property {number} scaleY - The scale factor in the y-axis.
 * @property {number} anchorX - The x-coordinate of the anchor point.
 * @property {number} anchorY - The y-coordinate of the anchor point.
 * @property {number} rotation - The rotation of the particle in radians.
 * @property {Texture} texture - The texture of the particle.
 * @property {ColorSource} tint - The tint color of the particle as a hexadecimal number.
 * @property {number} alpha - The alpha value of the particle.
 * @memberof scene
 */
export type ParticleOptions = Omit<Partial<IParticle>, 'color'> & {
    texture: Texture
    tint?: ColorSource;
    alpha?: number;
};

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
 * const particle = new Particle({
 *   texture,
 *   x: 100,
 *   y: 100,
 *   scaleX: 0.5,
 *   scaleY: 0.5,
 *   rotation: Math.PI / 2,
 *   color: 0xff0000,
 * });
 * ```
 * @implements {IParticle}
 * @memberof scene
 */
export class Particle implements IParticle
{
    /** Default options for constructing with options */
    public static defaultOptions: Partial<ParticleOptions> = {
        anchorX: 0,
        anchorY: 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        tint: 0xffffff,
        alpha: 1,
    };
    /** The x-coordinate of the anchor point. */
    public anchorX: number;
    /** The y-coordinate of the anchor point. */
    public anchorY: number;
    /** The x-coordinate of the particle. */
    public x: number;
    /** The y-coordinate of the particle. */
    public y: number;
    /** The scale factor in the x-axis. */
    public scaleX: number;
    /** The scale factor in the y-axis. */
    public scaleY: number;
    /** The rotation of the particle in radians. */
    public rotation: number;
    /** The color of the particle as a hexadecimal number. */
    public color: number;
    /** The texture of the particle. */
    public texture: Texture;

    private _alpha: number;
    private _tint: number;

    constructor(options: Texture | ParticleOptions)
    {
        if (options instanceof Texture)
        {
            this.texture = options;
            assignWithIgnore(this, Particle.defaultOptions, {});
        }
        else
        {
            const combined = { ...Particle.defaultOptions, ...options };

            assignWithIgnore(this, combined, {});
        }
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
        return bgr2rgb(this._tint);
    }

    set tint(value: ColorSource)
    {
        if (typeof value === 'number')
        {
            this._tint = value;
        }
        else
        {
            this._tint = Color.shared.setValue(value ?? 0xFFFFFF).toBgrNumber();
        }

        this._updateColor();
    }

    private _updateColor()
    {
        // combine alpha and tint
        this.color = this._tint + (((this._alpha * 255) | 0) << 24);
    }
}
