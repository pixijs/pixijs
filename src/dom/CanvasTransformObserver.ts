import { type Renderer } from '../rendering/renderers/types';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

/**
 * CanvasTransformObserver class synchronizes the DOM element's transform with the canvas size and position.
 * It uses ResizeObserver for efficient updates and requestAnimationFrame for fallback.
 * This ensures that the DOM element is always correctly positioned and scaled relative to the canvas.
 * @internal
 */
export class CanvasTransformObserver
{
    private _lastTransform = '';
    private _observer: ResizeObserver | null = null;
    private _canvas: HTMLCanvasElement;
    private readonly _domElement: HTMLElement;
    private readonly _renderer: Renderer;
    private _initialized = false;
    private _lastScaleX: number;
    private _lastScaleY: number;

    constructor(options: { domElement: HTMLElement; renderer: Renderer })
    {
        this._domElement = options.domElement;
        this._renderer = options.renderer;
    }

    /** The canvas element that this CanvasTransformObserver is associated with. */
    public get canvas(): HTMLCanvasElement
    {
        return this._canvas;
    }
    public set canvas(canvas: HTMLCanvasElement)
    {
        if (this._canvas !== canvas)
        {
            this._canvas = canvas;

            if (this._domElement.parentNode !== canvas.parentNode)
            {
                canvas.parentNode?.appendChild(this._domElement);
            }

            // If the CanvasTransformObserver is not initialized, we need to set it up
            if (!this._initialized)
            {
                this._init();
            }
            else
            {
                this.updateTranslation();
            }
        }
    }

    /**
     * Updates the transform of the DOM element based on the canvas size and position.
     * This method calculates the scale and translation needed to keep the DOM element in sync with the canvas.
     */
    public readonly updateTranslation = () =>
    {
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

    /**
     * Initializes the CanvasTransformObserver instance.
     * Sets up a ResizeObserver if available, or falls back to Ticker for updates.
     * This ensures that the DOM element is kept in sync with the canvas size and position.
     */
    private _init()
    {
        this._initialized = true;
        if ('ResizeObserver' in globalThis)
        {
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
        else
        {
            Ticker.shared.add(this.updateTranslation, undefined, UPDATE_PRIORITY.HIGH);
        }

        // Initial sync
        this.updateTranslation();
    }

    /** Destroys the CanvasTransformObserver instance, cleaning up observers and Ticker. */
    public destroy()
    {
        if (this._observer)
        {
            this._observer.disconnect();
            this._observer = null;
        }
        else
        {
            Ticker.shared.remove(this.updateTranslation);
        }

        (this._domElement as null) = null;
        (this._renderer as null) = null;
        this._canvas = null;
    }
}
