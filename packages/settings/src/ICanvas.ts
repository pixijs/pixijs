import type { ICanvasRenderingContext2D } from './ICanvasRenderingContext2D';

export type ContextIds = '2d' | 'bitmaprenderer' | 'webgl' | 'experimental-webgl' | 'webgl2' | 'experimental-webgl2';

type RenderingContext =
    ICanvasRenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext;

interface WebGLContextEventMap
{
    'webglcontextlost': WebGLContextEvent;
    'webglcontextrestore': WebGLContextEvent;
}

/**
 * Common interface for HTMLCanvasElement, OffscreenCanvas, and other custom canvas classes.
 * @memberof PIXI
 * @extends GlobalMixins.ICanvas
 * @extends Partial<EventTarget>
 */
export interface ICanvas extends GlobalMixins.ICanvas, Partial<EventTarget>
{
    /** Width of the canvas. */
    width: number;
    /** Height of the canvas. */
    height: number;

    /**
     * Get rendering context of the canvas.
     * @param {ContextIds} contextId - The identifier of the type of context to create.
     * @param {any} options - The options for creating context.
     * @returns {RenderingContext | null} The created context, or null if contextId is not supported.
     */
    getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings):
    ICanvasRenderingContext2D | null;
    getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings):
    ImageBitmapRenderingContext | null;
    getContext(contextId: 'webgl' | 'experimental-webgl', options?: WebGLContextAttributes):
    WebGLRenderingContext | null;
    getContext(contextId: 'webgl2' | 'experimental-webgl2', options?: WebGLContextAttributes):
    WebGL2RenderingContext | null;
    getContext(contextId: ContextIds, options?: any): RenderingContext | null;

    /**
     * Get the content of the canvas as data URL.
     * @param {string} type - The MIME type for the image format to return. If not specify, the default value is image/png.
     * @param {any} options - The options for creating data URL.
     * @returns {string} The content of the canvas as data URL.
     */
    toDataURL?(type?: string, options?: any): string;

    /**
     * Adds the listener for the specified event.
     * @param {string} type - The type of event to listen for.
     * @param {EventListenerOrEventListenerObject} listener - The callback to invoke when the event is fired.
     * @param {boolean | AddEventListenerOptions} options - The options for adding event listener.
     */
    addEventListener?(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions): void;
    addEventListener?<K extends keyof WebGLContextEventMap>(
        type: K,
        listener: (this: ICanvas, ev: WebGLContextEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions): void;

    /**
     * Removes the listener for the specified event.
     * @param {string} type - The type of event to listen for.
     * @param {EventListenerOrEventListenerObject} listener - The callback to invoke when the event is fired.
     * @param {boolean | EventListenerOptions} options - The options for removing event listener.
     */
    removeEventListener?(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions): void;
    removeEventListener?<K extends keyof WebGLContextEventMap>(
        type: K,
        listener: (this: ICanvas, ev: WebGLContextEventMap[K]) => any,
        options?: boolean | EventListenerOptions): void;

    /**
     * Dispatches a event.
     * @param {Event} event - The Event object to dispatch. Its Event.target property will be set to the current EventTarget.
     * @returns {boolean} Returns false if event is cancelable, and at least one of the event handlers which received event
     *                    called Event.preventDefault(). Otherwise true.
     */
    dispatchEvent(event: Event): boolean;
}