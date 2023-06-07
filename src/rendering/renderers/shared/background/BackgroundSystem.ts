import { ExtensionType } from '../../../../extensions/Extensions';
import { hex2rgb, hex2string } from '../../../../utils/color/hex';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { ISystem } from '../system/ISystem';

/**
 * Options for the background system.
 * @ignore
 */
export interface BackgroundSystemOptions
{
    /**
     * The background color used to clear the canvas. See {@link PIXI.ColorSource} for accepted color values.
     * @memberof PIXI.WebGLRendererOptions
     */
    backgroundColor: number; // TODO: ColorSource;
    /**
     * Alias for {@link PIXI.WebGLRendererOptions.backgroundColor}
     * @memberof PIXI.WebGLRendererOptions
     */
    background?: number; // TODO: ColorSource
    /**
     * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @memberof PIXI.WebGLRendererOptions
     */
    backgroundAlpha: number;
    /**
     * Whether to clear the canvas before new render passes.
     * @memberof PIXI.WebGLRendererOptions
     */
    clearBeforeRender: boolean;
}

export const defaultBackgroundOptions = {
    alpha: 1,
    color: 0x000000,
    clearBeforeRender: true,
};

type ColorObject = { r: number; g: number; b: number; a: number };

/**
 * The background system manages the background color and alpha of the main view.
 * @memberof PIXI
 */
export class BackgroundSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
            ExtensionType.WebGPURendererSystem,
            ExtensionType.CanvasRendererSystem,
        ],
        name: 'background',
        priority: 0,
    };

    /** @ignore */
    static defaultOptions: BackgroundSystemOptions = {
        /**
         * {@link PIXI.WebGLRendererOptions.backgroundAlpha}
         * @default 1
         */
        backgroundAlpha: 1,
        /**
         * {@link PIXI.WebGLRendererOptions.backgroundColor}
         * @default 0x000000
         */
        backgroundColor: 0x0,
        /**
         * {@link PIXI.WebGLRendererOptions.clearBeforeRender}
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

    private _backgroundColorString: string;
    private _backgroundColorRgba: [number, number, number, number];
    private _backgroundColor: number;
    private readonly _backgroundColorRgbaObject: ColorObject;

    constructor()
    {
        this.clearBeforeRender = true;

        this._backgroundColor = 0x000000;

        this._backgroundColorRgba = [0, 0, 0, 1];
        this._backgroundColorRgbaObject = { r: 0, g: 0, b: 0, a: 1 };

        this._backgroundColorString = '#000000';

        this.color = this._backgroundColor; // run bg color setter
        this.alpha = 1;
    }

    /**
     * initiates the background system
     * @param options - the options for the background colors
     */
    init(options: BackgroundSystemOptions): void
    {
        options = { ...defaultBackgroundOptions, ...options };

        this.clearBeforeRender = options.clearBeforeRender;
        this.color = options.backgroundColor || this._backgroundColor; // run bg color setter
        this.alpha = options.backgroundAlpha;
    }

    /** The background color to fill if not transparent */
    get color(): number
    {
        return this._backgroundColor;
    }

    set color(value: number)
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);

        const rgbaObject = this._backgroundColorRgbaObject;
        const rgba = this._backgroundColorRgba;

        hex2rgb(value, rgba);

        rgbaObject.r = rgba[0];
        rgbaObject.g = rgba[1];
        rgbaObject.b = rgba[2];
        rgbaObject.a = rgba[3];
    }

    /** The background color alpha. Setting this to 0 will make the canvas transparent. */
    get alpha(): number
    {
        return this._backgroundColorRgba[3];
    }

    set alpha(value: number)
    {
        this._backgroundColorRgba[3] = value;
    }

    /** The background color as an [R, G, B, A] array. */
    get colorRgba(): [number, number, number, number]
    {
        return this._backgroundColorRgba;
    }

    get colorRgbaObject(): ColorObject
    {
        return this._backgroundColorRgbaObject;
    }

    /** The background color as a string. */
    get colorString(): string
    {
        return this._backgroundColorString;
    }

    destroy(): void
    {
        // ka boom!
    }
}
