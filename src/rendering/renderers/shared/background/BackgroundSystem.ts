import { Color } from '../../../../color/Color';
import { ExtensionType } from '../../../../extensions/Extensions';

import type { ColorSource } from '../../../../color/Color';
import type { System } from '../system/System';

/**
 * Options for the background system.
 * @ignore
 */
export interface BackgroundSystemOptions
{
    /**
     * The background color used to clear the canvas. See {@link PIXI.ColorSource} for accepted color values.
     * @memberof PIXI.WebGLOptions
     */
    backgroundColor: ColorSource;
    /**
     * Alias for {@link PIXI.WebGLOptions.backgroundColor}
     * @memberof PIXI.WebGLOptions
     */
    background?: ColorSource
    /**
     * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @memberof PIXI.WebGLOptions
     */
    backgroundAlpha: number;
    /**
     * Whether to clear the canvas before new render passes.
     * @memberof PIXI.WebGLOptions
     */
    clearBeforeRender: boolean;
}

export const defaultBackgroundOptions = {
    alpha: 1,
    color: 0x000000,
    clearBeforeRender: true,
};

/**
 * The background system manages the background color and alpha of the main view.
 * @memberof PIXI
 */
export class BackgroundSystem implements System
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

    /** @ignore */
    public static defaultOptions: BackgroundSystemOptions = {
        /**
         * {@link PIXI.WebGLOptions.backgroundAlpha}
         * @default 1
         */
        backgroundAlpha: 1,
        /**
         * {@link PIXI.WebGLOptions.backgroundColor}
         * @default 0x000000
         */
        backgroundColor: 0x0,
        /**
         * {@link PIXI.WebGLOptions.clearBeforeRender}
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
    private _backgroundColorRgba: [number, number, number, number] = [0, 0, 0, 0];

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
        options = { ...defaultBackgroundOptions, ...options };

        this.clearBeforeRender = options.clearBeforeRender;
        this.color = options.backgroundColor || this._backgroundColor; // run bg color setter
        this.alpha = options.backgroundAlpha;
    }

    /** The background color to fill if not transparent */
    get color(): Color
    {
        return this._backgroundColor;
    }

    set color(value: ColorSource)
    {
        this._backgroundColor.setValue(value);
        this._backgroundColorRgba = this._backgroundColor.toRgbAArray() as [number, number, number, number];
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
    get colorRgba(): [number, number, number, number]
    {
        return this._backgroundColorRgba;
    }

    public destroy(): void
    {
        // ka boom!
    }
}
