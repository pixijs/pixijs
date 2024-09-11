import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';
import { RenderTarget } from '../renderTarget/RenderTarget';
import { getCanvasTexture } from '../texture/utils/getCanvasTexture';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { TypeOrBool } from '../../../../scene/container/destroyTypes';
import type { System } from '../system/System';
import type { CanvasSource } from '../texture/sources/CanvasSource';
import type { Texture } from '../texture/Texture';

/**
 * Options passed to the ViewSystem
 * @memberof rendering
 * @property {number} [width=800] - The width of the screen.
 * @property {number} [height=600] - The height of the screen.
 * @property {ICanvas} [canvas] - The canvas to use as a view, optional.
 * @property {boolean} [autoDensity=false] - Resizes renderer view in CSS pixels to allow for resolutions other than 1.
 * @property {number} [resolution] - The resolution / device pixel ratio of the renderer.
 * @property {boolean} [antialias=false] - Whether to enable anti-aliasing. This may affect performance.
 * @property {boolean} [depth] -
 * Whether to ensure the main view has can make use of the depth buffer. Always true for WebGL renderer.
 * @property {boolean} [multiView] - TODO: multiView
 * @property {number} [backgroundAlpha] - The alpha of the background.
 */
export interface ViewSystemOptions
{
    /**
     * The width of the screen.
     * @default 800
     * @memberof rendering.SharedRendererOptions
     */
    width?: number;
    /**
     * The height of the screen.
     * @default 600
     * @memberof rendering.SharedRendererOptions
     */
    height?: number;
    /**
     * The canvas to use as a view, optional.
     * @memberof rendering.SharedRendererOptions
     */
    canvas?: ICanvas;
    /** @deprecated */
    view?: ICanvas;
    /**
     * Resizes renderer view in CSS pixels to allow for resolutions other than 1.
     * @memberof rendering.SharedRendererOptions
     */
    autoDensity?: boolean;
    /**
     * The resolution / device pixel ratio of the renderer.
     * @memberof rendering.SharedRendererOptions
     */
    resolution?: number;
    /**
     * Whether to enable anti-aliasing. This may affect performance.
     * @memberof rendering.SharedRendererOptions
     */
    antialias?: boolean;
    /**
     * Whether to ensure the main view has can make use of the depth buffer. Always true for WebGL renderer.
     * @memberof rendering.SharedRendererOptions
     */
    depth?: boolean;

    /**
     * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @default 1
     */
    backgroundAlpha?: number;
}

export interface ViewSystemDestroyOptions
{
    /** Whether to remove the view element from the DOM. Defaults to `false`. */
    removeView?: boolean;
}

/**
 * The view system manages the main canvas that is attached to the DOM.
 * This main role is to deal with how the holding the view reference and dealing with how it is resized.
 * @memberof rendering
 */
export class ViewSystem implements System<ViewSystemOptions, TypeOrBool<ViewSystemDestroyOptions>>
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

    /** The default options for the view system. */
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

    /** The canvas element that everything is drawn to. */
    public canvas!: ICanvas;

    /** The texture that is used to draw the canvas to the screen. */
    public texture: Texture<CanvasSource>;

    /**
     * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
     * @member {boolean}
     */
    public get autoDensity(): boolean
    {
        return this.texture.source.autoDensity;
    }
    public set autoDensity(value: boolean)
    {
        this.texture.source.autoDensity = value;
    }

    /** Whether to enable anti-aliasing. This may affect performance. */
    public antialias: boolean;

    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     *
     * Its safe to use as filterArea or hitArea for the whole stage.
     */
    public screen: Rectangle;
    /** The render target that the view is drawn to. */
    public renderTarget: RenderTarget;

    /** The resolution / device pixel ratio of the renderer. */
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

        if (options.view)
        {
            // #if _DEBUG
            deprecation(v8_0_0, 'ViewSystem.view has been renamed to ViewSystem.canvas');
            // #endif

            options.canvas = options.view;
        }

        this.screen = new Rectangle(0, 0, options.width, options.height);
        this.canvas = options.canvas || DOMAdapter.get().createCanvas();
        this.antialias = !!options.antialias;
        this.texture = getCanvasTexture(this.canvas, options);
        this.renderTarget = new RenderTarget({
            colorTextures: [this.texture],
            depth: !!options.depth,
            isRoot: true,
        });

        this.texture.source.transparent = options.backgroundAlpha < 1;
        this.resolution = options.resolution;
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

        this.screen.width = this.texture.frame.width;
        this.screen.height = this.texture.frame.height;
    }

    /**
     * Destroys this System and optionally removes the canvas from the dom.
     * @param {options | false} options - The options for destroying the view, or "false".
     * @param options.removeView - Whether to remove the view element from the DOM. Defaults to `false`.
     */
    public destroy(options: TypeOrBool<ViewSystemDestroyOptions> = false): void
    {
        const removeView = typeof options === 'boolean' ? options : !!options?.removeView;

        if (removeView && this.canvas.parentNode)
        {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        // note: don't nullify the element
        //       other systems may need to unbind from it during the destroy iteration (eg. GLContextSystem)
    }
}
