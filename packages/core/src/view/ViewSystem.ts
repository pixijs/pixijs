import { Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { IRenderer } from '../IRenderer';
import { ISystem } from '../system/ISystem';

/**
 * Options passed to the ViewSystem
 * @memberof PIXI
 */
export interface ViewOptions
{
    /** The width of the screen. */
    width: number
    /** The height of the screen. */
    height: number
    /** The canvas to use as a view, optional. */
    view?: HTMLCanvasElement;
    /** Resizes renderer view in CSS pixels to allow for resolutions other than 1. */
    autoDensity?: boolean
    /** The resolution / device pixel ratio of the renderer. */
    resolution?: number
}

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @memberof PIXI
 */
export class ViewSystem implements ISystem
{
    private renderer: IRenderer;

    /**
     * The resolution / device pixel ratio of the renderer.
     * @member {number}
     * @default PIXI.settings.RESOLUTION
     */
    public resolution: number;

    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     *
     * Its safe to use as filterArea or hitArea for the whole stage.
     * @member {PIXI.Rectangle}
     */
    public screen: Rectangle;

    /**
     * The canvas element that everything is drawn to.
     * @member {HTMLCanvasElement}
     */
    public element: HTMLCanvasElement;

    /**
     * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
     * @member {boolean}
     */
    public autoDensity: boolean;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * initiates the view system
     * @param {PIXI.ViewOptions} options - the options for the view
     */
    init(options: ViewOptions): void
    {
        this.screen = new Rectangle(0, 0, options.width, options.height);

        this.element = options.view || document.createElement('canvas');

        this.resolution = options.resolution || settings.RESOLUTION;

        this.autoDensity = !!options.autoDensity;
    }

    /**
     * Resizes the screen and canvas to the specified dimensions.
     * @param desiredScreenWidth - The new width of the screen.
     * @param desiredScreenHeight - The new height of the screen.
     */
    resizeView(desiredScreenWidth: number, desiredScreenHeight: number): void
    {
        this.element.width = Math.round(desiredScreenWidth * this.resolution);
        this.element.height = Math.round(desiredScreenHeight * this.resolution);

        const screenWidth = this.element.width / this.resolution;
        const screenHeight = this.element.height / this.resolution;

        this.screen.width = screenWidth;
        this.screen.height = screenHeight;

        if (this.autoDensity)
        {
            this.element.style.width = `${screenWidth}px`;
            this.element.style.height = `${screenHeight}px`;
        }

        /**
         * Fired after view has been resized.
         * @event PIXI.Renderer#resize
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        this.renderer.emit('resize', screenWidth, screenHeight);
        this.renderer.runners.resize.emit(this.screen.height, this.screen.width);
    }

    /**
     * Destroys this System and optionally removes the canvas from the dom.
     * @param {boolean} [removeView=false] - Whether to remove the canvas from the DOM.
     */
    destroy(removeView: boolean): void
    {
        // ka boom!
        if (removeView && this.element.parentNode)
        {
            this.element.parentNode.removeChild(this.element);
        }

        this.renderer = null;
        this.element = null;
        this.screen = null;
    }
}
