import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { ImageSource } from '../../../../rendering/renderers/shared/texture/sources/ImageSource';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { uid } from '../../../../utils/data/uid';

import type { ColorSource } from '../../../../color/Color';
import type { PointData } from '../../../../maths/point/PointData';

// TODO: Support radial gradients

/** Types of gradients supported with FillGradient */
export type GradientType = 'linear';

/** Options for creating a linear fill gradient */
export interface FillGradientLinearOptions
{
    /** Gradient type */
    type: 'linear';

    /** Start point of the linear gradient */
    start: PointData;

    /** End point of the linear gradient */
    end: PointData;
}

/** Options for creating a fill gradient */
export type FillGradientOptions = FillGradientLinearOptions & {
    /** Gradient type */
    type: GradientType;

    /** Size of the texture to use */
    textureSize?: number;

    /** Optional, array of color stops */
    stops?: Array<{ offset: number, color: ColorSource }>;
};

/**
 * Create a fill gradient that can be used on Graphics or Text.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient
 * @example
 * const gradient = new FillGradient({
 *  type: 'linear',
 *  start: { x: 0, y: 0 },
 *  end: { x: 50, y: 50 },
 *  stops: [
 *   { offset: 0, color: 'red' },
 *   { offset: 0.5, color: 'green' },
 *   { offset: 1, color: 'blue' }
 *  ]
 * });
 */
export class FillGradient implements CanvasGradient
{
    /** Default texture size */
    public static defaultTextureSize = 256;

    /** Size of the texture to use */
    public readonly textureSize: number;

    /** unique id for this fill gradient */
    public readonly uid: number = uid('fillGradient');

    /** The type of gradient shape */
    public readonly shape: FillGradientLinearOptions;

    /** Internal texture created */
    public texture: Texture | null = null;

    /** Transform matrix for the gradient */
    public transform: Matrix | null = null;

    /** Gradient stops */
    public readonly gradientStops: Array<{ offset: number, color: string }> = [];

    /** Unique style key for gradient */
    private _styleKey: string | null = null;

    /**
     * Define a gradient based on the options provided.
     * @param options - Options for the gradient
     */
    constructor(options: FillGradientOptions);

    /**
     * Convenience constructor for creating a linear gradient. This may be deprecated in the future,
     * it's recommended to use the options object instead.
     * @param x0 - Start X-position
     * @param y0 - Start Y-position
     * @param x1 - End X-position
     * @param y1 - End Y-position
     */
    constructor(x0: number, y0: number, x1: number, y1: number);

    /** @ignore */
    constructor(...args: [number, number, number, number] | [FillGradientOptions])
    {
        let options: FillGradientOptions;

        if (typeof args[0] === 'number')
        {
            const [x0, y0, x1, y1] = args;

            options = { type: 'linear', start: { x: x0, y: y0 }, end: { x: x1, y: y1 } };
        }
        else
        {
            options = args[0];
        }

        const { stops = [], textureSize = FillGradient.defaultTextureSize, ...shape } = options;

        this.shape = shape;
        this.textureSize = textureSize;

        if (stops.length)
        {
            for (const stop of stops)
            {
                this.addColorStop(stop.offset, stop.color);
            }
        }
    }

    /** @deprecated since 8.7.0 */
    public get type(): GradientType { return this.shape.type; }

    /** @deprecated since 8.7.0 */
    public get x0(): number { return this.shape.start.x; }

    /** @deprecated since 8.7.0 */
    public get y0(): number { return this.shape.start.y; }

    /** @deprecated since 8.7.0 */
    public get x1(): number { return this.shape.end.x; }

    /** @deprecated since 8.7.0 */
    public get y1(): number { return this.shape.end.y; }

    /**
     * Add a new color stop
     * @param offset - Offset of the color stop, clamp between 0 and 1
     * @param color - Color of the stop
     */
    public addColorStop(offset: number, color: ColorSource): this
    {
        this.gradientStops.push({ offset, color: Color.shared.setValue(color).toHexa() });
        this._styleKey = null;

        return this;
    }

    /** Build the gradient texture */
    public build(): void
    {
        if (this.texture) return;

        switch (this.shape.type)
        {
            case 'linear':
                this._buildLinearGradient();
                break;
            // TODO: radial gradients
            default:
                throw new Error(`Unsupported gradient type: ${this.type}`);
        }
    }

    /** Dispose of the internal texture, doesn't change any of the stops or shape information */
    public dispose(): void
    {
        this.texture?.destroy(true);
        this.texture = null;
        this.transform = null;
        this._styleKey = null;
    }

    /** Build the linear gradient */
    private _buildLinearGradient(): void
    {
        const { gradientStops, textureSize } = this;
        const canvas = DOMAdapter.get().createCanvas(textureSize, 1);

        canvas.width = textureSize;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, textureSize, 1);

        for (let i = 0; i < gradientStops.length; i++)
        {
            const stop = gradientStops[i];

            gradient.addColorStop(stop.offset, stop.color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, textureSize, 1);

        this.texture = new Texture({
            source: new ImageSource({
                resource: canvas,
                addressModeU: 'clamp-to-edge',
                addressModeV: 'repeat',
            }),
        });

        // generate some UVS based on the gradient direction sent
        const { start, end } = this.shape;

        const m = new Matrix();

        // get angle
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        const dist = Math.sqrt((dx * dx) + (dy * dy));

        const angle = Math.atan2(dy, dx);

        m.translate(-start.x, -start.y);
        m.scale(1 / textureSize, 1 / textureSize);
        m.rotate(-angle);
        m.scale(textureSize / dist, 1);

        this.transform = m;
        this._styleKey = null;
    }

    /**
     * Get the style key
     * @readonly
     */
    public get styleKey(): string
    {
        if (this._styleKey)
        {
            return this._styleKey;
        }

        const stops = this.gradientStops.map((stop) => `${stop.offset}-${stop.color}`).join('-');
        const texture = this.texture.uid;
        const transform = this.transform.toArray().join('-');
        const { type, start: { x: x0, y: y0 }, end: { x: x1, y: y1 } } = this.shape;

        return `fill-gradient-${this.uid}-${stops}-${texture}-${transform}-${type}-${x0}-${y0}-${x1}-${y1}`;
    }

    /** Destroy and don't use after calling */
    public destroy(): void
    {
        this.dispose();
        this.gradientStops.length = 0;
    }
}
