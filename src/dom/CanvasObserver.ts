import { type Renderer } from '../rendering/renderers/types';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

const typeSymbol = Symbol.for('pixijs.CanvasObserver');

/**
 * CanvasObserver class synchronizes the DOM element's transform with the canvas size and position.
 * It uses ResizeObserver for efficient updates and requestAnimationFrame for fallback.
 * This ensures that the DOM element is always correctly positioned and scaled relative to the canvas.
 * @internal
 */
export class CanvasObserver
{
    /**
     * Type symbol used to identify instances of CanvasObserver.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a CanvasObserver.
     * @param obj - The object to check.
     * @returns True if the object is a CanvasObserver, false otherwise.
     */
    public static isCanvasObserver(obj: any): obj is CanvasObserver
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** A cached value of the last transform applied to the DOM element. */
    private _lastTransform = '';
    /** A ResizeObserver instance to observe changes in the canvas size. */
    private _observer: ResizeObserver | null = null;
    /** The canvas element that this observer is associated with. */
    private _canvas: HTMLCanvasElement;
    /** The DOM element that will be transformed based on the canvas size and position. */
    private readonly _domElement: HTMLElement;
    /** The renderer instance that this observer is associated with. */
    private readonly _renderer: Renderer;
    /** The last scale values applied to the DOM element, used to avoid unnecessary updates. */
    private _lastScaleX: number;
    /** The last scale values applied to the DOM element, used to avoid unnecessary updates. */
    private _lastScaleY: number;
    /** A flag to indicate whether the observer is attached to the Ticker for continuous updates. */
    private _tickerAttached = false;

    constructor(options: { domElement: HTMLElement; renderer: Renderer })
    {
        this._domElement = options.domElement;
        this._renderer = options.renderer;

        // We need to ensure that the canvas is not an OffscreenCanvas
        if (globalThis.OffscreenCanvas && this._renderer.canvas instanceof OffscreenCanvas) return;
        this._canvas = this._renderer.canvas;
        this._attachObserver();
    }

    /** The canvas element that this CanvasObserver is associated with. */
    public get canvas(): HTMLCanvasElement
    {
        return this._canvas;
    }

    /** Attaches the DOM element to the canvas parent if it is not already attached. */
    public ensureAttached()
    {
        if (!this._domElement.parentNode && this._canvas.parentNode)
        {
            this._canvas.parentNode.appendChild(this._domElement);
            this.updateTranslation();
        }
    }

    /**
     * Updates the transform of the DOM element based on the canvas size and position.
     * This method calculates the scale and translation needed to keep the DOM element in sync with the canvas.
     */
    public readonly updateTranslation = () =>
    {
        if (!this._canvas) return;

        const rect = this._canvas.getBoundingClientRect(); // still needed for left/top
        const contentWidth = this._canvas.width;
        const contentHeight = this._canvas.height;

        const sx = (rect.width / contentWidth) * this._renderer.resolution;
        const sy = (rect.height / contentHeight) * this._renderer.resolution;
        const tx = rect.left;
        const ty = rect.top;

        const newTransform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;

        if (newTransform !== this._lastTransform)
        {
            this._domElement.style.transform = newTransform;
            this._lastTransform = newTransform;
        }
    };

    /** Sets up a ResizeObserver if available. This ensures that the DOM element is kept in sync with the canvas size . */
    private _attachObserver()
    {
        if ('ResizeObserver' in globalThis)
        {
            if (this._observer)
            {
                this._observer.disconnect();
                this._observer = null;
            }

            this._observer = new ResizeObserver((entries) =>
            {
                for (const entry of entries)
                {
                    if (entry.target !== this._canvas)
                    {
                        continue;
                    }

                    const contentWidth = this.canvas.width;
                    const contentHeight = this.canvas.height;
                    const sx = (entry.contentRect.width / contentWidth) * this._renderer.resolution;
                    const sy = (entry.contentRect.height / contentHeight) * this._renderer.resolution;

                    // Only refetch position if scale actually changed
                    const needsUpdate = this._lastScaleX !== sx || this._lastScaleY !== sy;

                    if (needsUpdate)
                    {
                        this.updateTranslation(); // safely fetch `left` and `top` only when needed
                        this._lastScaleX = sx;
                        this._lastScaleY = sy;
                    }
                }
            });
            this._observer.observe(this._canvas);
        }
        else if (!this._tickerAttached)
        {
            Ticker.shared.add(this.updateTranslation, this, UPDATE_PRIORITY.HIGH);
        }
    }

    /** Destroys the CanvasObserver instance, cleaning up observers and Ticker. */
    public destroy()
    {
        if (this._observer)
        {
            this._observer.disconnect();
            this._observer = null;
        }
        else if (this._tickerAttached)
        {
            Ticker.shared.remove(this.updateTranslation);
        }

        (this._domElement as null) = null;
        (this._renderer as null) = null;
        this._canvas = null;
        this._tickerAttached = false;
        this._lastTransform = '';
        this._lastScaleX = null;
        this._lastScaleY = null;
    }
}
