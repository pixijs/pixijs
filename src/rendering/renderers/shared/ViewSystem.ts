import { ExtensionType } from '../../../extensions/Extensions';
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { settings } from '../../../settings/settings';
import { getCanvasTexture } from './texture/utils/getCanvasTexture';

import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { System } from './system/System';
import type { CanvasSourceOptions } from './texture/sources/CanvasSource';
import type { Texture } from './texture/Texture';

/**
 * Options passed to the ViewSystem
 * @memberof PIXI
 */
export interface ViewSystemOptions
{
    /**
     * The width of the screen.
     * @memberof PIXI.WebGLOptions
     */
    width?: number;
    /**
     * The height of the screen.
     * @memberof PIXI.WebGLOptions
     */
    height?: number;
    /**
     * The canvas to use as a view, optional.
     * @memberof PIXI.WebGLOptions
     */
    element?: ICanvas;
    /**
     * Resizes renderer view in CSS pixels to allow for resolutions other than 1.
     * @memberof PIXI.WebGLOptions
     */
    autoDensity?: boolean;
    /**
     * The resolution / device pixel ratio of the renderer.
     * @memberof PIXI.WebGLOptions
     */
    resolution?: number;
    /**
     * **WebGL Only.** Whether to enable anti-aliasing. This may affect performance.
     * @memberof PIXI.WebGLOptions
     */
    antialias?: boolean;
    /**
     * TODO: multiView
     * @memberof PIXI.WebGLOptions
     */
    multiView?: boolean;
}

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @memberof PIXI
 */
export class ViewSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'view',
        priority: 0,
    } as const;

    /** @ignore */
    public static defaultOptions: ViewSystemOptions = {
        /**
         * {@link PIXI.WebGLOptions.width}
         * @default 800
         */
        width: 800,
        /**
         * {@link PIXI.WebGLOptions.height}
         * @default 600
         */
        height: 600,
        /**
         * {@link PIXI.WebGLOptions.resolution}
         * @type {number}
         * @default PIXI.settings.RESOLUTION
         */
        resolution: settings.RESOLUTION,
        /**
         * {@link PIXI.WebGLOptions.autoDensity}
         * @default false
         */
        autoDensity: false,
        /**
         * {@link PIXI.WebGLOptions.antialias}
         * @default false
         */
        antialias: false,
    };

    public multiView: boolean;

    /** The canvas element that everything is drawn to. */
    public element: ICanvas;

    public texture: Texture;

    /**
     * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
     * @member {boolean}
     */
    public autoDensity: boolean;

    public antialias: boolean;

    public screen: Rectangle;

    get resolution(): number
    {
        return this.texture.source._resolution;
    }

    set resolution(value: number)
    {
        this.texture.source.resize(
            this.texture.source.width,
            this.texture.source.height,
            value
        );
    }

    /**
     * initiates the view system
     * @param options - the options for the view
     */
    public init(options: ViewSystemOptions): void
    {
        options = {
            ...ViewSystem.defaultOptions,
            ...options,
        };

        this.screen = new Rectangle(0, 0, options.width, options.height);
        this.element = options.element || settings.ADAPTER.createCanvas();
        this.antialias = !!options.antialias;
        this.texture = getCanvasTexture(this.element, options as CanvasSourceOptions);
        this.multiView = !!options.multiView;

        if (this.autoDensity)
        {
            this.element.style.width = `${this.texture.width}px`;
            this.element.style.height = `${this.texture.height}px`;
        }
    }

    /**
     * Resizes the screen and canvas to the specified dimensions.
     * @param desiredScreenWidth - The new width of the screen.
     * @param desiredScreenHeight - The new height of the screen.
     * @param resolution
     */
    public resize(desiredScreenWidth: number, desiredScreenHeight: number, resolution: number): void
    {
        this.texture.source.resize(desiredScreenWidth, desiredScreenHeight, resolution);

        this.screen.width = this.texture.frameWidth;
        this.screen.height = this.texture.frameHeight;

        if (this.autoDensity)
        {
            this.element.style.width = `${desiredScreenWidth}px`;
            this.element.style.height = `${desiredScreenHeight}px`;
        }
    }

    /**
     * Destroys this System and optionally removes the canvas from the dom.
     * @param {boolean} [removeView=false] - Whether to remove the canvas from the DOM.
     */
    public destroy(removeView: boolean): void
    {
        // ka boom!
        if (removeView && this.element.parentNode)
        {
            this.element.parentNode.removeChild(this.element);
        }

        // this._renderer = null;
        this.element = null;
    }
}
