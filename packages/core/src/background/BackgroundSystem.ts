import { Color } from '@pixi/color';
import { extensions, ExtensionType } from '@pixi/extensions';

import type { ColorSource } from '@pixi/color';
import type { ExtensionMetadata } from '@pixi/extensions';
import type { ISystem } from '../system/ISystem';
import type { StartupOptions } from '../systems';

export interface BackgroundOptions
{
    /** the main canvas background alpha. From 0 (fully transparent) to 1 (fully opaque). */
    alpha: number,
    /** the main canvas background color. */
    color: ColorSource,
    /** sets if the renderer will clear the canvas or not before the new render pass. */
    clearBeforeRender: boolean,
}

/**
 * The background system manages the background color and alpha of the main view.
 * @memberof PIXI
 */
export class BackgroundSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.RendererSystem,
            ExtensionType.CanvasRendererSystem
        ],
        name: 'background',
    };

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
     * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
     * to clear the canvas every frame. Disable this by setting this to false. For example, if
     * your game has a canvas filling background image you often don't need this set.
     * @member {boolean}
     * @default
     */
    public clearBeforeRender: boolean;

    /** Reference to the internal color */
    private _backgroundColor: Color;

    constructor()
    {
        this.clearBeforeRender = true;
        this._backgroundColor = new Color(0x0);
        this.alpha = 1;
    }

    /**
     * initiates the background system
     * @param {StartupOptions} options - the options for the background colors
     */
    init(options: StartupOptions): void
    {
        this.clearBeforeRender = options.clearBeforeRender;
        const { backgroundColor, background, backgroundAlpha } = options;
        const color = background ?? backgroundColor;

        if (color)
        {
            this.color = options.color;
        }

        this.alpha = backgroundAlpha;
    }

    /**
     * The background color to fill if not transparent.
     * @member {PIXI.ColorSource}
     */
    get color(): ColorSource
    {
        return this._backgroundColor.value;
    }

    set color(value: ColorSource)
    {
        this._backgroundColor.setValue(value);
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     * @member {number}
     */
    get alpha(): number
    {
        return this._backgroundColor.alpha;
    }

    set alpha(value: number)
    {
        this._backgroundColor.setAlpha(value);
    }

    /** The background color object. */
    get backgroundColor(): Color
    {
        return this._backgroundColor;
    }

    destroy(): void
    {
        // ka boom!
    }
}

extensions.add(BackgroundSystem);
