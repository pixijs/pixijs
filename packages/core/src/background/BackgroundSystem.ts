import { hex2rgb, hex2string, string2hex } from '@pixi/utils';
import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';
import type { ISystem } from '../system/ISystem';

export interface BackgroundOptions
{
    /** the main canvas background alpha. From 0 (fully transparent) to 1 (fully opaque). */
    alpha: number,
    /** the main canvas background color. */
    color: number | string,
    /** sets if the renderer will clear the canvas or not before the new render pass. */
    clearBeforeRender: boolean,
}

/**
 * The background system manages the background color and alpha of the main view.
 * @memberof PIXI
 */
export class BackgroundSystem implements ISystem<BackgroundOptions>
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

    private _backgroundColorString: string;
    private _backgroundColorRgba: number[];
    private _backgroundColor: number;

    constructor()
    {
        this.clearBeforeRender = true;

        this._backgroundColor = 0x000000;

        this._backgroundColorRgba = [0, 0, 0, 1];

        this._backgroundColorString = '#000000';

        this.color = this._backgroundColor; // run bg color setter
        this.alpha = 1;
    }

    /**
     * initiates the background system
     * @param {BackgroundOptions} options - the options for the background colors
     */
    init(options: BackgroundOptions): void
    {
        this.clearBeforeRender = options.clearBeforeRender;

        if (options.color)
        {
            this.color = typeof options.color === 'string'
                ? string2hex(options.color)
                : options.color;
        }

        this.alpha = options.alpha;
    }

    /**
     * The background color to fill if not transparent
     * @member {number}
     */
    get color(): number
    {
        return this._backgroundColor;
    }

    set color(value: number)
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);
        hex2rgb(value, this._backgroundColorRgba);
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     * @member {number}
     */
    get alpha(): number
    {
        return this._backgroundColorRgba[3];
    }

    set alpha(value: number)
    {
        this._backgroundColorRgba[3] = value;
    }

    /**
     * The background color as an [R, G, B, A] array.
     * @member {number[]}
     * @protected
     */
    get colorRgba(): number[]
    {
        return this._backgroundColorRgba;
    }

    /**
     * The background color as a string.
     * @member {string}
     * @protected
     */
    get colorString(): string
    {
        return this._backgroundColorString;
    }

    destroy(): void
    {
        // ka boom!
    }
}

extensions.add(BackgroundSystem);
