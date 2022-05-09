import { Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { IRenderer } from './IRenderer';
import { ISystem } from './ISystem';

export interface ViewOptions {
    width: number
    height: number
    autoDensity?: boolean
    resolution?: number
}

export class ViewSystem implements ISystem
{
    private renderer: IRenderer;

    public resolution: number;
    public screen: Rectangle;
    public view: HTMLCanvasElement;
    public autoDensity: boolean;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;
    }

    init(options: ViewOptions): void
    {
        /**
         * Measurements of the screen. (0, 0, screenWidth, screenHeight).
         *
         * Its safe to use as filterArea or hitArea for the whole stage.
         *
         * @member {PIXI.Rectangle}
         */
        this.screen = new Rectangle(0, 0, options.width, options.height);

        /**
          * The canvas element that everything is drawn to.
          *
          * @member {HTMLCanvasElement}
          */
        this.view = options.view || document.createElement('canvas');

        /**
          * The resolution / device pixel ratio of the renderer.
          *
          * @member {number}
          * @default PIXI.settings.RESOLUTION
          */
        this.resolution = options.resolution || settings.RESOLUTION;

        /**
          * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
          *
          * @member {boolean}
          */
        this.autoDensity = !!options.autoDensity;
    }

    resizeView(desiredScreenWidth: number, desiredScreenHeight: number): void
    {
        this.view.width = Math.round(desiredScreenWidth * this.resolution);
        this.view.height = Math.round(desiredScreenHeight * this.resolution);

        const screenWidth = this.view.width / this.resolution;
        const screenHeight = this.view.height / this.resolution;

        this.screen.width = screenWidth;
        this.screen.height = screenHeight;

        if (this.autoDensity)
        {
            this.view.style.width = `${screenWidth}px`;
            this.view.style.height = `${screenHeight}px`;
        }

        /**
         * Fired after view has been resized.
         *
         * @event PIXI.Renderer#resize
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        this.renderer.emit('resize', screenWidth, screenHeight);
        this.renderer.runners.resize.emit(this.screen.height, this.screen.width);
    }

    destroy(removeView: boolean): void
    {
        // ka boom!
        if (removeView && this.view.parentNode)
        {
            this.view.parentNode.removeChild(this.view);
        }

        this.renderer = null;
        this.view = null;
        this.screen = null;
    }
}
