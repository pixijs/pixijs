import { deprecation, hex2rgb, hex2string } from '@pixi/utils';
import { ISystem } from './ISystem';

export interface BackgroundOptions {
    backgroundAlpha: number,
    backgroundColor: number,
    clearBeforeRender: boolean
    /**
     * @deprecated The method should not be used
     */
    transparent?: boolean
}

export class BackgroundSystem implements ISystem
{
    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
     * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
     * to clear the canvas every frame. Disable this by setting this to false. For example, if
     * your game has a canvas filling background image you often don't need this set.
     *
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

        this.backgroundColor = this._backgroundColor; // run bg color setter
        this.backgroundAlpha = 1;
    }

    init(options: BackgroundOptions): void
    {
        if (options.transparent !== undefined)
        {
            // #if _DEBUG
            deprecation('6.0.0', 'Option transparent is deprecated, please use backgroundAlpha instead.');
            // #endif

            options.backgroundAlpha = options.transparent ? 0 : 1;
        }

        this.clearBeforeRender = options.clearBeforeRender;
        this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter
        this.backgroundAlpha = options.backgroundAlpha;
    }

    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor(): number
    {
        return this._backgroundColor;
    }

    set backgroundColor(value: number)
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);
        hex2rgb(value, this._backgroundColorRgba);
    }

    /**
     * The background color alpha. Setting this to 0 will make the canvas transparent.
     *
     * @member {number}
     */
    get backgroundAlpha(): number
    {
        return this._backgroundColorRgba[3];
    }

    set backgroundAlpha(value: number)
    {
        this._backgroundColorRgba[3] = value;
    }

    /**
     * The background color as an [R, G, B, A] array.
     *
     * @member {number[]}
     * @protected
     */
    get backgroundColorRgba(): number[]
    {
        return this._backgroundColorRgba;
    }

    /**
     * The background color as a string.
     *
     * @member {string}
     * @protected
     */
    get backgroundColorString(): string
    {
        return this._backgroundColorString;
    }

    destroy(): void
    {
        // ka boom!
    }
}
