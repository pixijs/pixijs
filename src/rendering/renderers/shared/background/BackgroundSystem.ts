import { Color } from '../../../../color/Color';
import { ExtensionType } from '../../../../extensions/Extensions';

import type { ColorSource, RgbaArray } from '../../../../color/Color';
import type { System } from '../system/System';

/**
 * Options for the background system.
 * @property {ColorSource} [backgroundColor='black']
 * The background color used to clear the canvas. See {@link ColorSource} for accepted color values.
 * @property {ColorSource} [background] - Alias for backgroundColor
 * @property {number} [backgroundAlpha=1] -
 * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
 * @property {boolean} [clearBeforeRender=true] - Whether to clear the canvas before new render passes.
 * @memberof rendering
 */
export interface BackgroundSystemOptions
{
    /**
     * The background color used to clear the canvas. See {@link ColorSource} for accepted color values.
     * @memberof rendering.SharedRendererOptions
     * @default 'black'
     */
    backgroundColor: ColorSource;
    /**
     * Alias for backgroundColor
     * @memberof rendering.SharedRendererOptions
     */
    background?: ColorSource
    /**
     * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @memberof rendering.SharedRendererOptions
     * @default 1
     */
    backgroundAlpha: number;
    /**
     * Whether to clear the canvas before new render passes.
     * @memberof rendering.SharedRendererOptions
     * @default true
     */
    clearBeforeRender: boolean;
}

/**
 * The background system manages the background color and alpha of the main view.
 * @memberof rendering
 */
export class BackgroundSystem implements System<BackgroundSystemOptions>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'background',
        priority: 0,
    } as const;

    /** default options used by the system */
    public static defaultOptions: BackgroundSystemOptions = {
        /**
         * {@link WebGLOptions.backgroundAlpha}
         * @default 1
         */
        backgroundAlpha: 1,
        /**
         * {@link WebGLOptions.backgroundColor}
         * @default 0x000000
         */
        backgroundColor: 0x0,
        /**
         * {@link WebGLOptions.clearBeforeRender}
         * @default true
         */
        clearBeforeRender: true,
    };

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
     * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
     * to clear the canvas every frame. Disable this by setting this to false. For example, if
     * your game has a canvas filling background image you often don't need this set.
     */
    public clearBeforeRender: boolean;

    private readonly _backgroundColor: Color;

    constructor()
    {
        this.clearBeforeRender = true;

        this._backgroundColor = new Color(0x000000);

        this.color = this._backgroundColor; // run bg color setter
        this.alpha = 1;
    }

    /**
     * initiates the background system
     * @param options - the options for the background colors
     */
    public init(options: BackgroundSystemOptions): void
    {
        options = { ...BackgroundSystem.defaultOptions, ...options };

        this.clearBeforeRender = options.clearBeforeRender;
        this.color = options.background || options.backgroundColor || this._backgroundColor; // run bg color setter
        this.alpha = options.backgroundAlpha;

        this._backgroundColor.setAlpha(options.backgroundAlpha);
    }

    /** The background color to fill if not transparent */
    get color(): Color
    {
        return this._backgroundColor;
    }

    set color(value: ColorSource)
    {
        this._backgroundColor.setValue(value);
    }

    /** The background color alpha. Setting this to 0 will make the canvas transparent. */
    get alpha(): number
    {
        return this._backgroundColor.alpha;
    }

    set alpha(value: number)
    {
        this._backgroundColor.setAlpha(value);
    }

    /** The background color as an [R, G, B, A] array. */
    get colorRgba(): RgbaArray
    {
        return this._backgroundColor.toArray() as RgbaArray;
    }

    /**
     * destroys the background system
     * @internal
     * @ignore
     */
    public destroy(): void
    {
        // No cleanup required
    }
}
