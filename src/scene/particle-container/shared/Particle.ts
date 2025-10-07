import { Color } from '../../../color/Color';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { bgr2rgb } from '../../container/container-mixins/getGlobalMixin';
import { assignWithIgnore } from '../../container/utils/assignWithIgnore';

import type { ColorSource } from '../../../color/Color';

/**
 * Represents a particle with properties for position, scale, rotation, color, and texture.
 * Particles are lightweight alternatives to sprites, optimized for use in particle systems.
 * @example
 * ```ts
 * // Create a basic particle
 * const particle = new Particle({
 *     texture: Texture.from('particle.png'),
 *     x: 100,
 *     y: 100,
 *     scaleX: 0.5,
 *     scaleY: 0.5,
 *     rotation: Math.PI / 4,  // 45 degrees
 *     tint: 0xff0000,        // Red tint
 *     alpha: 0.8             // Slightly transparent
 * });
 *
 * // Modify particle properties
 * particle.x += 10;          // Move right
 * particle.rotation += 0.1;   // Rotate slightly
 * particle.alpha = 0.5;      // Change transparency
 *
 * // Use anchor points (0-1 range)
 * particle.anchorX = 0.5;    // Center horizontally
 * particle.anchorY = 0.5;    // Center vertically
 * ```
 * @category scene
 * @standard
 */
export interface IParticle
{
    /** The x-coordinate of the particle position */
    x: number;

    /** The y-coordinate of the particle position */
    y: number;

    /**
     * The horizontal scale factor of the particle
     * @default 1
     */
    scaleX: number;

    /**
     * The vertical scale factor of the particle
     * @default 1
     */
    scaleY: number;

    /**
     * The x-coordinate of the particle's anchor point (0-1 range)
     * @default 0
     */
    anchorX: number;

    /**
     * The y-coordinate of the particle's anchor point (0-1 range)
     * @default 0
     */
    anchorY: number;

    /**
     * The rotation of the particle in radians
     * @default 0
     */
    rotation: number;

    /**
     * The color of the particle as a 32-bit RGBA value
     * @default 0xffffffff
     */
    color: number;

    /** The texture used to render this particle */
    texture: Texture;
}

/**
 * Configuration options for creating a new particle. All properties except texture are optional
 * and will use default values if not specified.
 * @example
 * ```ts
 * // Create a basic red particle
 * const particle = new Particle({
 *     texture: Texture.from('particle.png'),
 *     tint: 0xff0000,
 *     alpha: 0.8
 * });
 *
 * // Create a scaled and rotated particle
 * const rotatedParticle = new Particle({
 *     texture: Texture.from('star.png'),
 *     x: 100,
 *     y: 100,
 *     scaleX: 2,
 *     scaleY: 2,
 *     rotation: Math.PI / 4,
 *     anchorX: 0.5,
 *     anchorY: 0.5
 * });
 *
 * // Use color strings for tint
 * const coloredParticle = new Particle({
 *     texture: Texture.from('circle.png'),
 *     tint: '#ff00ff',     // Magenta
 *     alpha: 0.5,          // Half transparent
 *     x: 200,
 *     y: 200
 * });
 * ```
 * @see {@link Particle} For the particle implementation
 * @see {@link IParticle} For the full particle interface
 * @category scene
 * @standard
 * @category scene
 * @standard
 */
export type ParticleOptions = Omit<Partial<IParticle>, 'color'> & {
    /** The texture used to render this particle */
    texture: Texture;
    /** The tint color as a hex number or CSS color string */
    tint?: ColorSource;
    /** The alpha transparency (0-1) */
    alpha?: number;
};

/**
 * Represents a single particle within a particle container. This class implements the IParticle interface,
 * providing properties and methods to manage the particle's position, scale, rotation, color, and texture.
 *
 * The reason we use a particle over a sprite is that these are much lighter weight and we can create a lot of them
 * without taking on the overhead of a full sprite.
 * @example
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
 * @category scene
 * @standard
 */
export class Particle implements IParticle
{
    /**
     * Default options used when creating new particles. These values are applied when specific
     * options aren't provided in the constructor.
     * @example
     * ```ts
     * // Override defaults globally
     * Particle.defaultOptions = {
     *     ...Particle.defaultOptions,
     *     anchorX: 0.5,
     *     anchorY: 0.5,
     *     alpha: 0.8
     * };
     *
     * // New particles use modified defaults
     * const centeredParticle = new Particle(texture);
     * console.log(centeredParticle.anchorX); // 0.5
     * console.log(centeredParticle.alpha); // 0.8
     * ```
     * @see {@link ParticleOptions} For all available options
     * @see {@link Particle} For the particle implementation
     */
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
    /**
     * The x-coordinate of the anchor point (0-1).
     * Controls the origin point for rotation and scaling.
     * @example
     * ```ts
     * particle.anchorX = 0.5; // Center horizontally
     * ```
     * @default 0
     */
    public anchorX: number;

    /**
     * The y-coordinate of the anchor point (0-1).
     * Controls the origin point for rotation and scaling.
     * @example
     * ```ts
     * particle.anchorY = 0.5; // Center vertically
     * ```
     * @default 0
     */
    public anchorY: number;

    /**
     * The x-coordinate of the particle in world space.
     * @example
     * ```ts
     * particle.x = 100; // Move right
     * particle.x += Math.sin(time) * 10; // Oscillate horizontally
     * ```
     * @default 0
     */
    public x: number;

    /**
     * The y-coordinate of the particle in world space.
     * @example
     * ```ts
     * particle.y = 100; // Move down
     * particle.y += Math.cos(time) * 10; // Oscillate vertically
     * ```
     * @default 0
     */
    public y: number;

    /**
     * The horizontal scale factor of the particle.
     * Values greater than 1 increase size, less than 1 decrease size.
     * @example
     * ```ts
     * particle.scaleX = 2; // Double width
     * particle.scaleX *= 0.9; // Shrink over time
     * ```
     * @default 1
     */
    public scaleX: number;

    /**
     * The vertical scale factor of the particle.
     * Values greater than 1 increase size, less than 1 decrease size.
     * @example
     * ```ts
     * particle.scaleY = 2; // Double height
     * particle.scaleY *= 0.9; // Shrink over time
     * ```
     * @default 1
     */
    public scaleY: number;

    /**
     * The rotation of the particle in radians.
     * Positive values rotate clockwise.
     * @example
     * ```ts
     * particle.rotation = Math.PI; // 180 degrees
     * particle.rotation += 0.1; // Rotate slowly clockwise
     * ```
     * @default 0
     */
    public rotation: number;

    /**
     * The color of the particle as a 32-bit RGBA value.
     * Combines tint and alpha into a single value.
     * @example
     * ```ts
     * // Usually set via tint and alpha properties
     * particle.tint = 0xff0000; // Red
     * particle.alpha = 0.5; // Half transparent
     * console.log(particle.color); // Combined RGBA value
     * ```
     * @default 0xffffffff
     */
    public color: number;

    /**
     * The texture used to render this particle.
     * All particles in a container should share the same base texture.
     * @example
     * ```ts
     * particle.texture = Texture.from('particle.png');
     * ```
     */
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

    /**
     * The transparency of the particle. Values range from 0 (fully transparent)
     * to 1 (fully opaque). Values outside this range are clamped.
     * @example
     * ```ts
     * // Create a semi-transparent particle
     * const particle = new Particle({
     *     texture: Texture.from('particle.png'),
     *     alpha: 0.5
     * });
     *
     * // Fade out
     * particle.alpha *= 0.9;
     *
     * // Fade in
     * particle.alpha = Math.min(particle.alpha + 0.1, 1);
     *
     * // Values are clamped to valid range
     * particle.alpha = 1.5; // Becomes 1.0
     * particle.alpha = -0.5; // Becomes 0.0
     *
     * // Animate transparency
     * app.ticker.add((delta) => {
     *     const time = performance.now() / 1000;
     *     particle.alpha = 0.5 + Math.sin(time) * 0.5; // Pulse between 0-1
     * });
     * ```
     * @default 1
     * @see {@link Particle#tint} For controlling particle color
     * @see {@link Particle#color} For the combined color and alpha value
     */
    get alpha(): number
    {
        return this._alpha;
    }

    set alpha(value: number)
    {
        this._alpha = Math.min(Math.max(value, 0), 1);

        this._updateColor();
    }

    /**
     * The tint color of the particle. Can be set using hex numbers or CSS color strings.
     * The tint is multiplied with the texture color to create the final particle color.
     * @example
     * ```ts
     * // Create a red particle
     * const particle = new Particle({
     *     texture: Texture.from('particle.png'),
     *     tint: 0xff0000
     * });
     *
     * // Use CSS color strings
     * particle.tint = '#00ff00';  // Green
     * particle.tint = 'blue';     // Blue
     *
     * // Animate tint color
     * app.ticker.add(() => {
     *     const time = performance.now() / 1000;
     *
     *     // Cycle through hues
     *     const hue = (time * 50) % 360;
     *     particle.tint = `hsl(${hue}, 100%, 50%)`;
     * });
     *
     * // Reset to white (no tint)
     * particle.tint = 0xffffff;
     * ```
     * @type {ColorSource} Hex number or CSS color string
     * @default 0xffffff
     * @see {@link Particle#alpha} For controlling transparency
     * @see {@link Particle#color} For the combined color and alpha value
     * @see {@link Color} For supported color formats
     */
    get tint(): number
    {
        return bgr2rgb(this._tint);
    }

    set tint(value: ColorSource)
    {
        this._tint = Color.shared.setValue(value ?? 0xFFFFFF).toBgrNumber();

        this._updateColor();
    }

    private _updateColor()
    {
        // combine alpha and tint
        this.color = this._tint + (((this._alpha * 255) | 0) << 24);
    }
}
