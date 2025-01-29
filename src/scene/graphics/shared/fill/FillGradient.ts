import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { ImageSource } from '../../../../rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { uid } from '../../../../utils/data/uid';
import { deprecation } from '../../../../utils/logging/deprecation';
import { definedProps } from '../../../container/utils/definedProps';
import { type PointData } from '~/maths/point/PointData';

import type { ColorSource } from '../../../../color/Color';
import type { CanvasAndContext } from '../../../../rendering/renderers/shared/texture/CanvasPool';
import type { TextureSpace } from '../FillTypes';

export type GradientType = 'linear' | 'radial';

/**
 * Represents the style options for a linear gradient fill.
 * @memberof scene
 */
export interface BaseGradientOptions
{
    /** The type of gradient */
    type?: GradientType;
    /** Array of colors stops to use in the gradient */
    colorStops?: { offset: number, color: ColorSource }[];
    /** Whether coordinates are 'global' or 'local' */
    textureSpace?: TextureSpace;
    /**
     * The size of the texture to use for the gradient - this is for advanced usage.
     * The texture size does not need to match the size of the object being drawn.
     * Due to GPU interpolation, gradient textures can be relatively small!
     * Consider using a larger texture size if your gradient has a lot of very tight color steps
     */
    textureSize?: number;
}

/**
 * Options specific to linear gradients.
 * A linear gradient creates a smooth transition between colors along a straight line defined by start and end points.
 * @memberof scene
 */
export interface LinearGradientOptions extends BaseGradientOptions
{
    /** The type of gradient. Must be 'linear' for linear gradients. */
    type?: 'linear';

    /**
     * The start point of the gradient.
     * This point defines where the gradient begins.
     * It is represented as a PointData object containing x and y coordinates.
     * The coordinates are in local space by default (0-1), but can be in global space if specified.
     */
    start?: PointData;

    /**
     * The end point of the gradient.
     * This point defines where the gradient ends.
     * It is represented as a PointData object containing x and y coordinates.
     * The coordinates are in local space by default (0-1), but can be in global space if specified.
     */
    end?: PointData;
}

/**
 * Options specific to radial gradients.
 * A radial gradient creates a smooth transition between colors that radiates outward in a circular pattern.
 * The gradient is defined by inner and outer circles, each with their own radius.
 * @memberof scene
 */
export interface RadialGradientOptions extends BaseGradientOptions
{
    /** The type of gradient. Must be 'radial' for radial gradients. */
    type?: 'radial';
    /** The center point of the inner circle where the gradient begins. In local coordinates by default (0-1). */
    center?: PointData;
    /** The radius of the inner circle where the gradient begins. */
    innerRadius?: number;
    /** The center point of the outer circle where the gradient ends. In local coordinates by default (0-1). */
    outerCenter?: PointData;
    /** The radius of the outer circle where the gradient ends. */
    outerRadius?: number;
    /**
     * The y scale of the gradient, use this to make the gradient elliptical.
     * NOTE: Only applied to radial gradients used with Graphics.
     */
    scale?: number;
    /**
     * The rotation of the gradient in radians, useful for making the gradient elliptical.
     * NOTE: Only applied to radial gradients used with Graphics.
     */
    rotation?: number;

}

/**
 * Options for creating a gradient fill.
 * @memberof scene
 */
export type GradientOptions = LinearGradientOptions | RadialGradientOptions;

/**
 * If no color stops are provided, we use a default gradient of white to black - this is to avoid a blank gradient if a dev
 * forgets to set them.
 */
const emptyColorStops: { offset: number, color: string }[] = [{ offset: 0, color: 'white' }, { offset: 1, color: 'black' }];

/**
 * Class representing a gradient fill that can be used to fill shapes and text.
 * Supports both linear and radial gradients with multiple color stops.
 *
 * For linear gradients, color stops define colors and positions (0 to 1) along a line from start point (x0,y0)
 * to end point (x1,y1).
 *
 * For radial gradients, color stops define colors between two circles - an inner circle centered at (x0,y0) with radius r0,
 * and an outer circle centered at (x1,y1) with radius r1.
 * @example
 * ```ts
 * // Create a vertical linear gradient from red to blue
 * const linearGradient = new FillGradient({
 *     type: 'linear',
 *     start: { x: 0, y: 0 },  // Start at top
 *     end: { x: 0, y: 1 },    // End at bottom
 *     colorStops: [
 *         { offset: 0, color: 'red' },   // Red at start
 *         { offset: 1, color: 'blue' }   // Blue at end
 *     ],
 *     // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
 *     textureSpace: 'local'
 * });
 *
 * // Create a radial gradient from yellow center to green edge
 * const radialGradient = new FillGradient({
 *     type: 'radial',
 *     center: { x: 0.5, y: 0.5 },
 *     innerRadius: 0,
 *     outerCenter: { x: 0.5, y: 0.5 },
 *     outerRadius: 0.5,
 *     colorStops: [
 *         { offset: 0, color: 'yellow' }, // Center color
 *         { offset: 1, color: 'green' }   // Edge color
 *     ],
 *     // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
 *     textureSpace: 'local'
 * });
 *
 * // Create a rainbow linear gradient in global coordinates
 * const globalGradient = new FillGradient({
 *     type: 'linear',
 *     start: { x: 0, y: 0 },
 *     end: { x: 100, y: 0 },
 *     colorStops: [
 *         { offset: 0, color: 0xff0000 },    // Red
 *         { offset: 0.33, color: 0x00ff00 }, // Green
 *         { offset: 0.66, color: 0x0000ff }, // Blue
 *         { offset: 1, color: 0xff00ff }     // Purple
 *     ],
 *     textureSpace: 'global'  // Use world coordinates
 * });
 *
 * // Create an offset radial gradient
 * const offsetRadial = new FillGradient({
 *     type: 'radial',
 *     center: { x: 0.3, y: 0.3 },
 *     innerRadius: 0.1,
 *     outerCenter: { x: 0.5, y: 0.5 },
 *     outerRadius: 0.5,
 *     colorStops: [
 *         { offset: 0, color: 'white' },
 *         { offset: 1, color: 'black' }
 *     ],
 *     // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
 *     textureSpace: 'local'
 * });
 * ```
 *
 * Internally this creates a  texture of the gradient then applies a
 * transform to it to give it the correct size and angle.
 *
 * This means that it's important to destroy a gradient when it is no longer needed
 * to avoid memory leaks.
 *
 * If you want to animate a gradient then it's best to modify and update an existing one
 * rather than creating a whole new one each time. That or use a custom shader.
 * @memberof scene
 * @implements {CanvasGradient}
 */
export class FillGradient implements CanvasGradient
{
    /**
     * Default options for creating a gradient fill
     * @property {PointData} start - Start point of the gradient (default: { x: 0, y: 0 })
     * @property {PointData} end - End point of the gradient (default: { x: 0, y: 1 })
     * @property {TextureSpace} textureSpace - Whether coordinates are 'global' or 'local' (default: 'local')
     * @property {number} textureSize - The size of the texture to use for the gradient (default: 256)
     * @property {Array<{offset: number, color: ColorSource}>} colorStops - Array of color stops (default: empty array)
     * @property {GradientType} type - Type of gradient (default: 'linear')
     */
    public static readonly defaultLinearOptions: LinearGradientOptions = {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        colorStops: [],
        textureSpace: 'local',
        type: 'linear',
        textureSize: 256
    };

    /**
     * Default options for creating a radial gradient fill
     * @property {PointData} innerCenter - Center of the inner circle (default: { x: 0.5, y: 0.5 })
     * @property {number} innerRadius - Radius of the inner circle (default: 0)
     * @property {PointData} outerCenter - Center of the outer circle (default: { x: 0.5, y: 0.5 })
     * @property {number} outerRadius - Radius of the outer circle (default: 0.5)
     * @property {TextureSpace} textureSpace - Whether coordinates are 'global' or 'local' (default: 'local')
     * @property {number} textureSize - The size of the texture to use for the gradient (default: 256)
     * @property {Array<{offset: number, color: ColorSource}>} colorStops - Array of color stops (default: empty array)
     * @property {GradientType} type - Type of gradient (default: 'radial')
     */
    public static readonly defaultRadialOptions: RadialGradientOptions = {
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerRadius: 0.5,
        colorStops: [],
        scale: 1,
        textureSpace: 'local',
        type: 'radial',
        textureSize: 256
    };

    /** Unique identifier for this gradient instance */
    public readonly uid: number = uid('fillGradient');
    /** Type of gradient - currently only supports 'linear' */
    public readonly type: GradientType = 'linear';

    /** Internal texture used to render the gradient */
    public texture: Texture;
    /** Transform matrix for positioning the gradient */
    public transform: Matrix;
    /** Array of color stops defining the gradient */
    public colorStops: Array<{ offset: number, color: string }> = [];

    /** Whether gradient coordinates are in local or global space */
    public textureSpace: TextureSpace;
    private readonly _textureSize: number;

    /** The start point of the linear gradient */
    public start: PointData;
    /** The end point of the linear gradient */
    public end: PointData;

    /** The center point of the inner circle of the radial gradient */
    public center: PointData;
    /** The center point of the outer circle of the radial gradient */
    public outerCenter: PointData;
    /** The radius of the inner circle of the radial gradient */
    public innerRadius: number;
    /** The radius of the outer circle of the radial gradient */
    public outerRadius: number;
    /** The scale of the radial gradient */
    public scale: number;
    /** The rotation of the radial gradient */
    public rotation: number;

    /**
     * Creates a new gradient fill. The constructor behavior changes based on the gradient type.
     *
     * For linear gradients:
     * @param {GradientOptions} options - The options for the gradient
     * @param {PointData} [options.start] - The start point of the linear gradient
     * @param {PointData} [options.end] - The end point of the linear gradient
     *
     * For radial gradients:
     * @param {PointData} [options.innerCenter] - The center point of the inner circle of the radial gradient
     * @param {number} [options.innerRadius] - The radius of the inner circle of the radial gradient
     * @param {PointData} [options.outerCenter] - The center point of the outer circle of the radial gradient
     * @param {number} [options.outerRadius] - The radius of the outer circle of the radial gradient
     *
     * Common options for both gradient types:
     * @param {TextureSpace} [options.textureSpace='local'] - Whether coordinates are 'global' or 'local'
     * @param {number} [options.textureSize=256] - The size of the texture to use for the gradient
     * @param {Array<{offset: number, color: ColorSource}>} [options.colorStops=[]] - Array of color stops
     * @param {GradientType} [options.type='linear'] - Type of gradient
     */
    constructor(options: GradientOptions);
    /** @deprecated since 8.5.2 */
    constructor(
        x0?: number,
        y0?: number,
        x1?: number,
        y1?: number,
        textureSpace?: TextureSpace,
        textureSize?: number
    );
    constructor(...args: [GradientOptions] | [number?, number?, number?, number?, TextureSpace?, number?])
    {
        let options = ensureGradientOptions(args);

        const defaults = options.type === 'radial' ? FillGradient.defaultRadialOptions : FillGradient.defaultLinearOptions;

        options = { ...defaults, ...definedProps(options) };

        this._textureSize = options.textureSize;

        if (options.type === 'radial')
        {
            this.center = options.center;
            this.outerCenter = options.outerCenter ?? this.center;
            this.innerRadius = options.innerRadius;
            this.outerRadius = options.outerRadius;
            this.scale = options.scale;
            this.rotation = options.rotation;
        }
        else
        {
            this.start = options.start;
            this.end = options.end;
        }

        this.textureSpace = options.textureSpace;

        this.type = options.type;
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

        const colorStops = this.colorStops.length ? this.colorStops : emptyColorStops;

        const defaultSize = this._textureSize;

        const { canvas, context } = getCanvas(defaultSize, 1);

        const gradient = context.createLinearGradient(0, 0, this._textureSize, 0);

        addColorStops(gradient, colorStops);

        context.fillStyle = gradient;
        context.fillRect(0, 0, defaultSize, 1);

        this.texture = new Texture({
            source: new ImageSource({
                resource: canvas,
            }),
        });

        // generate some UVS based on the gradient direction sent

        const { x: x0, y: y0 } = this.start;
        const { x: x1, y: y1 } = this.end;

        const m = new Matrix();

        // get angle
        const dx = x1 - x0;
        const dy = y1 - y0;

        const dist = Math.sqrt((dx * dx) + (dy * dy));
        const angle = Math.atan2(dy, dx);

        // this matrix is inverted when used in the graphics
        m.scale(dist / defaultSize, 1);
        m.rotate(angle);
        m.translate(x0, y0);

        if (this.textureSpace === 'local')
        {
            m.scale(defaultSize, defaultSize);
        }

        this.transform = m;
    }

    public buildGradient(): void
    {
        if (this.type === 'linear')
        {
            this.buildLinearGradient();
        }
        else
        {
            this.buildRadialGradient();
        }
    }
    public buildRadialGradient(): void
    {
        if (this.texture) return;

        const colorStops = this.colorStops.length ? this.colorStops : emptyColorStops;

        const defaultSize = this._textureSize;
        const { canvas, context } = getCanvas(defaultSize, defaultSize);

        const { x: x0, y: y0 } = this.center;
        const { x: x1, y: y1 } = this.outerCenter;

        const r0 = this.innerRadius;
        const r1 = this.outerRadius;

        const ox = x1 - r1;
        const oy = y1 - r1;

        const scale = defaultSize / (r1 * 2);

        const cx = (x0 - ox) * scale;
        const cy = (y0 - oy) * scale;

        const gradient = context.createRadialGradient(
            cx,
            cy,
            r0 * scale,
            (x1 - ox) * scale,
            (y1 - oy) * scale,
            r1 * scale
        );

        addColorStops(gradient, colorStops);

        context.fillStyle = colorStops[colorStops.length - 1].color;
        context.fillRect(0, 0, defaultSize, defaultSize);

        context.fillStyle = gradient;

        // First translate to center
        context.translate(cx, cy);

        // Then apply rotation
        context.rotate(this.rotation);

        // Then scale2
        context.scale(1, this.scale);

        // Finally translate back, taking scale into account
        context.translate(-cx, -cy);

        context.fillRect(0, 0, defaultSize, defaultSize);

        this.texture = new Texture({
            source: new ImageSource({
                resource: canvas,
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
            }),
        });

        const m = new Matrix();

        // this matrix is inverted when used in the graphics
        m.scale(1 / scale, 1 / scale);
        m.translate(ox, oy);

        if (this.textureSpace === 'local')
        {
            m.scale(defaultSize, defaultSize);
        }

        this.transform = m;
    }

    /**
     * Gets a unique key representing the current state of the gradient.
     * Used internally for caching.
     * @returns Unique string key
     */
    public get styleKey(): number
    {
        return this.uid;
    }

    public destroy(): void
    {
        this.texture?.destroy(true);
        this.texture = null;
    }
}

function addColorStops(gradient: CanvasGradient, colorStops: { offset: number, color: string }[]): void
{
    for (let i = 0; i < colorStops.length; i++)
    {
        const stop = colorStops[i];

        gradient.addColorStop(stop.offset, stop.color);
    }
}

function getCanvas(width: number, height: number): CanvasAndContext
{
    const canvas = DOMAdapter.get().createCanvas(width, height);
    const context = canvas.getContext('2d');

    return { canvas, context };
}

/**
 * Helper function to ensure consistent handling of gradient options.
 * This function handles both the new options object format and the deprecated parameter format.
 * @example
 * // New recommended way:
 * const options = ensureGradientOptions({
 *     start: { x: 0, y: 0 },
 *     end: { x: 100, y: 100 },
 *     textureSpace: 'local'
 * });
 *
 * // Deprecated way (will show warning in debug):
 * const options = ensureGradientOptions([0, 0, 100, 100, 'local']);
 * @param args - Arguments passed to gradient constructor
 * @returns Normalized gradient options object
 * @internal
 */
function ensureGradientOptions(
    args: any[],
): GradientOptions
{
    let options = (args[0] ?? {}) as GradientOptions;

    // @deprecated
    if (typeof options === 'number' || args[1])
    {
        // #if _DEBUG
        deprecation('8.5.2', `use options object instead`);
        // #endif

        options = {
            type: 'linear',
            start: { x: args[0], y: args[1] },
            end: { x: args[2], y: args[3] },
            textureSpace: args[4] as 'global' | 'local',
            textureSize: args[5] ?? FillGradient.defaultLinearOptions.textureSize
        };
    }

    return options;
}
