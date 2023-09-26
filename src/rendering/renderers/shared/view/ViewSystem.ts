import { ExtensionType } from '../../../../extensions/Extensions';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { settings } from '../../../../settings/settings';
import { getCanvasTexture } from '../texture/utils/getCanvasTexture';

import type { DestroyOptions } from '../../../../scene/container/destroyTypes';
import type { ICanvas } from '../../../../settings/adapter/ICanvas';
import type { System } from '../system/System';
import type { CanvasSourceOptions } from '../texture/sources/CanvasSource';
import type { Texture } from '../texture/Texture';

/** Options passed to the ViewSystem */
export interface ViewSystemOptions
{
    /** The width of the screen. */
    width?: number;
    /** The height of the screen. */
    height?: number;
    /** The canvas to use as a view, optional. */
    element?: ICanvas;
    /** Resizes renderer view in CSS pixels to allow for resolutions other than 1. */
    autoDensity?: boolean;
    /** The resolution / device pixel ratio of the renderer. */
    resolution?: number;
    /** **WebGL Only.** Whether to enable anti-aliasing. This may affect performance. */
    antialias?: boolean;
    /** TODO: multiView */
    multiView?: boolean;
}

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
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
         * {@link WebGLOptions.width}
         * @default 800
         */
        width: 800,
        /**
         * {@link WebGLOptions.height}
         * @default 600
         */
        height: 600,
        /**
         * {@link WebGLOptions.resolution}
         * @type {number}
         * @default settings.RESOLUTION
         */
        resolution: settings.RESOLUTION,
        /**
         * {@link WebGLOptions.autoDensity}
         * @default false
         */
        autoDensity: false,
        /**
         * {@link WebGLOptions.antialias}
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
     * @param {options | false} options - The options for destroying the view, or "false".
     * @param options.removeView - Whether to remove the view element from the DOM. Defaults to `false`.
     */
    public destroy(options: DestroyOptions = false): void
    {
        const removeView = typeof options === 'boolean' ? options : !!options?.removeView;

        if (removeView && this.element.parentNode)
        {
            this.element.parentNode.removeChild(this.element);
        }

        // note: don't nullify the element
        //       other systems may need to unbind from it during the destroy iteration (eg. GLContextSystem)
    }
}
