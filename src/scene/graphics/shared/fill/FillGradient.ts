import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { ImageSource } from '../../../../rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { uid } from '../../../../utils/data/uid';
import { deprecation } from '../../../../utils/logging/deprecation';

import type { ColorSource } from '../../../../color/Color';
import type { TextureSpace } from '../FillTypes';

export type GradientType = 'linear' | 'radial';

/**
 * Represents the style options for a linear gradient fill.
 * @memberof scene
 */
export interface LinearGradientOptions
{
    /** The x coordinate of the starting point */
    x0?: number;
    /** The y coordinate of the starting point */
    y0?: number;
    /** The x coordinate of the end point */
    x1?: number;
    /** The y coordinate of the end point */
    y1?: number;

    /** Array of colors stops to use in the gradient */
    colorStops?: { offset: number, color: ColorSource }[];

    /** Whether coordinates are 'global' or 'local' */
    textureSpace?: TextureSpace;
}

/**
 * Class representing a gradient fill that can be used to fill shapes and text.
 * Supports linear gradients with multiple color stops. Color stops define the colors and their positions (from 0 to 1)
 * along the gradient line. For example, a stop at 0 sets the color at the start point (x0,y0), while a stop at 1
 * sets the color at the end point (x1,y1). Multiple stops can be added to create smooth transitions between colors.
 * @example
 * ```ts
 * // Create a vertical red-to-blue gradient
 * const gradient = new FillGradient(0, 0, 0, 1)
 *     .addColorStop(0, 0xff0000)    // Red at the top
 *     .addColorStop(1, 0x0000ff);   // Blue at the bottom
 *
 * // Create a horizontal gradient with multiple colors
 * const rainbow = new FillGradient(0, 0, 1, 0)
 *     .addColorStop(0, 0xff0000)    // Red
 *     .addColorStop(0.33, 0x00ff00) // Green
 *     .addColorStop(0.66, 0x0000ff) // Blue
 *     .addColorStop(1, 0xff00ff);   // Purple
 *
 * // Use gradient in global space (relative to world coordinates)
 * const globalGradient = new FillGradient(0, 0, 100, 100, 'global');
 * ```
 * @memberof scene
 * @implements {CanvasGradient}
 */
export class FillGradient implements CanvasGradient
{
    /** Default size of the internal gradient texture */
    public static defaultTextureSize = 256;

    /**
     * Default options for creating a gradient fill
     * @property {number} x0 - X coordinate of start point (default: 0)
     * @property {number} y0 - Y coordinate of start point (default: 0)
     * @property {number} x1 - X coordinate of end point (default: 1)
     * @property {number} y1 - Y coordinate of end point (default: 0)
     * @property {TextureSpace} textureSpace - Whether coordinates are 'global' or 'local' (default: 'local')
     */
    public static readonly defaultOptions: LinearGradientOptions = {
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 1,
        colorStops: [],
        textureSpace: 'local',
    };

    /** Unique identifier for this gradient instance */
    public readonly uid: number = uid('fillGradient');
    /** Type of gradient - currently only supports 'linear' */
    public readonly type: GradientType = 'linear';

    /** X coordinate of gradient start point */
    public x0: number;
    /** Y coordinate of gradient start point */
    public y0: number;
    /** X coordinate of gradient end point */
    public x1: number;
    /** Y coordinate of gradient end point */
    public y1: number;

    /** Internal texture used to render the gradient */
    public texture: Texture;
    /** Transform matrix for positioning the gradient */
    public transform: Matrix;
    /** Array of color stops defining the gradient */
    public colorStops: Array<{ offset: number, color: string }> = [];

    /** Internal cache of the style key */
    private _styleKey: string | null = null;
    /** Whether gradient coordinates are in local or global space */
    public textureSpace: TextureSpace = 'local';
    /**
     * Creates a new gradient fill
     * @param options - The options for the gradient
     * @param {number} [options.x0=0] - X coordinate of start point
     * @param {number} [options.y0=0] - Y coordinate of start point
     * @param {number} [options.x1=1] - X coordinate of end point
     * @param {number} [options.y1=0] - Y coordinate of end point
     * @param {string} [options.textureSpace='local'] - Whether coordinates are 'global' or 'local'
     */
    constructor(options: LinearGradientOptions);
    /** @deprecated since 8.5.2 */
    constructor(
        x0?: number,
        y0?: number,
        x1?: number,
        y1?: number,
        textureSpace?: 'global' | 'local'
    );
    constructor(...args: [LinearGradientOptions] | [number?, number?, number?, number?, TextureSpace?])
    {
        const options = { ...FillGradient.defaultOptions, ...ensureGradientOptions(args) };

        this.x0 = options.x0;
        this.x0 = options.x0;
        this.y0 = options.y0;

        this.x1 = options.x1;
        this.y1 = options.y1;

        this.textureSpace = options.textureSpace;

        options.colorStops.forEach((stop) =>
        {
            this.addColorStop(stop.offset, stop.color);
        });
    }

    /**
     * Adds a color stop to the gradient
     * @param offset - Position of the stop (0-1)
     * @param color - Color of the stop
     * @returns This gradient instance for chaining
     */
    public addColorStop(offset: number, color: ColorSource): this
    {
        this.colorStops.push({ offset, color: Color.shared.setValue(color).toHexa() });
        this._styleKey = null;

        return this;
    }

    /**
     * Builds the internal texture and transform for the gradient.
     * Called automatically when the gradient is first used.
     * @internal
     */
    public buildLinearGradient(): void
    {
        if (this.texture) return;

        const defaultSize = FillGradient.defaultTextureSize;

        const { colorStops: gradientStops } = this;

        const canvas = DOMAdapter.get().createCanvas();

        canvas.width = defaultSize;
        canvas.height = defaultSize;

        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, FillGradient.defaultTextureSize, 1);

        for (let i = 0; i < gradientStops.length; i++)
        {
            const stop = gradientStops[i];

            gradient.addColorStop(stop.offset, stop.color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, defaultSize, defaultSize);

        this.texture = new Texture({
            source: new ImageSource({
                resource: canvas,
                addressModeU: 'clamp-to-edge',
                addressModeV: 'repeat',
            }),
        });

        // generate some UVS based on the gradient direction sent

        const { x0, y0, x1, y1 } = this;

        const m = new Matrix();

        // get angle
        const dx = x1 - x0;
        const dy = y1 - y0;

        const dist = Math.sqrt((dx * dx) + (dy * dy));

        const angle = Math.atan2(dy, dx);

        // this matrix is inverted when used in the graphics
        m.scale(dist / 256, 1);
        m.rotate(angle);
        m.translate(x0, y0);

        if (this.textureSpace === 'local')
        {
            m.scale(defaultSize, defaultSize);
        }

        this.transform = m;
        this._styleKey = null;
    }

    /**
     * Gets a unique key representing the current state of the gradient.
     * Used internally for caching.
     * @returns Unique string key
     */
    public get styleKey(): string
    {
        if (this._styleKey)
        {
            return this._styleKey;
        }

        const stops = this.colorStops.map((stop) => `${stop.offset}-${stop.color}`).join('-');
        const texture = this.texture.uid;
        const transform = this.transform.toArray().join('-');

        return `fill-gradient-${this.uid}-${stops}-${texture}-${transform}-${this.x0}-${this.y0}-${this.x1}-${this.y1}`;
    }

    public destroy(): void
    {
        this.texture?.destroy(true);
        this.texture = null;
    }
}

/**
 * Helper function to ensure consistent handling of gradient options.
 * This function handles both the new options object format and the deprecated parameter format.
 * @example
 * // New recommended way:
 * const options = ensureGradientOptions([{
 *     x0: 0,
 *     y0: 0,
 *     x1: 100,
 *     y1: 100,
 *     textureSpace: 'local'
 * }]);
 *
 * // Deprecated way (will show warning in debug):
 * const options = ensureGradientOptions([0, 0, 100, 100, 'local']);
 * @param args - Arguments passed to gradient constructor
 * @returns Normalized gradient options object
 * @internal
 */
function ensureGradientOptions(
    args: any[],
): LinearGradientOptions
{
    let options = (args[0] ?? {}) as LinearGradientOptions;

    // @deprecated
    if (typeof options === 'number' || args[1])
    {
        // #if _DEBUG
        deprecation('8.5.2', `use options object instead`);
        // #endif

        options = {
            x0: args[0],
            y0: args[1],
            x1: args[2],
            y1: args[3],
            textureSpace: args[4] as 'global' | 'local',
        };
    }

    return options;
}
