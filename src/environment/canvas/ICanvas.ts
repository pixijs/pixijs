import type { ICanvasRenderingContext2D } from './ICanvasRenderingContext2D';

export type ContextIds = '2d'
| 'bitmaprenderer'
| 'webgl'
| 'experimental-webgl'
| 'webgl2'
| 'experimental-webgl2'
| 'webgpu';

export type PredefinedColorSpace = 'srgb' | 'display-p3';

export type RenderingContext =
    ICanvasRenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext;

export interface ICanvasRenderingContext2DSettings
{
    alpha?: boolean;
    colorSpace?: PredefinedColorSpace;
    desynchronized?: boolean;
    willReadFrequently?: boolean;
}

export type ContextSettings =
    ICanvasRenderingContext2DSettings | ImageBitmapRenderingContextSettings | WebGLContextAttributes;

export interface ICanvasParentNode
{
    /** Adds a node to the end of the list of children of the parent node. */
    appendChild(element: HTMLElement): void;
    /** Removes a child node from the parent node. */
    removeChild(element: HTMLElement): void;
    removeChild(element: ICanvas): void;
}

export interface ICanvasStyle
{
    width?: string;
    height?: string;
    cursor?: string;
    touchAction?: string;
    msTouchAction?: string;
    msContentZooming?: string;
}

export interface ICanvasRect
{
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WebGLContextEventMap
{
    'webglcontextlost': WebGLContextEvent;
    'webglcontextrestore': WebGLContextEvent;
}

/**
 * Common interface for HTMLCanvasElement, OffscreenCanvas, and other custom canvas classes.
 * @extends PixiMixins.ICanvas
 * @extends Partial<EventTarget>
 * @memberof environment
 */
export interface ICanvas extends PixiMixins.ICanvas, Partial<EventTarget>
{
    /** Width of the canvas. */
    width: number;
    /** Height of the canvas. */
    height: number;

    /**
     * Get rendering context of the canvas.
     * @param {ContextIds} contextId - The identifier of the type of context to create.
     * @param {ContextSettings} options - The options for creating context.
     * @returns {RenderingContext | null} The created context, or null if contextId is not supported.
     */
    getContext(
        contextId: '2d',
        options?: ICanvasRenderingContext2DSettings,
    ): ICanvasRenderingContext2D | null;
    getContext(
        contextId: 'bitmaprenderer',
        options?: ImageBitmapRenderingContextSettings,
    ): ImageBitmapRenderingContext | null;
    getContext(
        contextId: 'webgl' | 'experimental-webgl',
        options?: WebGLContextAttributes,
    ): WebGLRenderingContext | null;
    getContext(
        contextId: 'webgl2' | 'experimental-webgl2',
        options?: WebGLContextAttributes,
    ): WebGL2RenderingContext | null;
    getContext(
        contextId: 'webgpu',
    ): GPUCanvasContext | null;
    getContext(
        contextId: ContextIds,
        options?: ContextSettings,
    ): RenderingContext | null;

    /**
     * Get the content of the canvas as data URL.
     * @param {string} [type] - A string indicating the image format. The default type is `image/png`;
     *      that type is also used if the given type isn't supported.
     * @param {string} [quality] - A number between 0 and 1 indicating the image quality to be used when
     *      creating images using file formats that support lossy compression (such as `image/jpeg` or `image/webp`).
     *      A user agent will use its default quality value if this option is not specified, or if the number
     *      is outside the allowed range.
     * @returns {string} A string containing the requested data URL.
     */
    toDataURL?(type?: string, quality?: number): string;

    /**
     * Creates a Blob from the content of the canvas.
     * @param {(blob: Blob | null) => void} callback - A callback function with the resulting `Blob` object
     *      as a single argument. `null` may be passed if the image cannot be created for any reason.
     * @param {string} [type] - A string indicating the image format. The default type is `image/png`;
     *      that type is also used if the given type isn't supported.
     * @param {string} [quality] - A number between 0 and 1 indicating the image quality to be used when
     *      creating images using file formats that support lossy compression (such as `image/jpeg` or `image/webp`).
     *      A user agent will use its default quality value if this option is not specified, or if the number
     *      is outside the allowed range.
     * @returns {void}
     */
    toBlob?(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;

    /**
     * Get the content of the canvas as Blob.
     * @param {object} [options] - The options for creating Blob.
     * @param {string} [options.type] - A string indicating the image format. The default type is `image/png`;
     *      that type is also used if the given type isn't supported.
     * @param {string} [options.quality] - A number between 0 and 1 indicating the image quality to be used when
     *      creating images using file formats that support lossy compression (such as `image/jpeg` or `image/webp`).
     *      A user agent will use its default quality value if this option is not specified, or if the number
     *      is outside the allowed range.
     * @returns {Promise<Blob>} A `Promise` returning a Blob object representing the image contained in the canvas.
     */
    convertToBlob?(options?: { type?: string, quality?: number }): Promise<Blob>;

    /**
     * Adds the listener for the specified event.
     * @method
     * @param {string} type - The type of event to listen for.
     * @param {EventListenerOrEventListenerObject} listener - The callback to invoke when the event is fired.
     * @param {boolean | AddEventListenerOptions} options - The options for adding event listener.
     * @returns {void}
     */
    addEventListener?: {
        (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions): void;
        <K extends keyof WebGLContextEventMap>(
            type: K,
            listener: (this: ICanvas, ev: WebGLContextEventMap[K]) => any,
            options?: boolean | AddEventListenerOptions): void;
    };

    /**
     * Removes the listener for the specified event.
     * @method
     * @param {string} type - The type of event to listen for.
     * @param {EventListenerOrEventListenerObject} listener - The callback to invoke when the event is fired.
     * @param {boolean | EventListenerOptions} options - The options for removing event listener.
     * @returns {void}
     */
    removeEventListener?: {
        (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions): void;
        <K extends keyof WebGLContextEventMap>(
            type: K,
            listener: (this: ICanvas, ev: WebGLContextEventMap[K]) => any,
            options?: boolean | EventListenerOptions): void;
    };

    /**
     * Dispatches a event.
     * @param {Event} event - The Event object to dispatch. Its Event.target property will be set to the current EventTarget.
     * @returns {boolean} Returns false if event is cancelable, and at least one of the event handlers which received event
     *                    called Event.preventDefault(). Otherwise true.
     */
    dispatchEvent(event: Event): boolean;

    /** Parent node of the canvas. */
    readonly parentNode?: ICanvasParentNode | null;

    /** Style of the canvas. */
    readonly style?: ICanvasStyle;

    /**
     * Get the position and the size of the canvas.
     * @returns The smallest rectangle which contains the entire canvas.
     */
    getBoundingClientRect?(): ICanvasRect;
}
