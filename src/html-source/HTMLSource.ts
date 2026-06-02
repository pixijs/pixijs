import { ExtensionType } from '../extensions/Extensions';
import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { TextureSourceOptions } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { HTMLSourceCanvas } from './HTMLSourceTypes';

/**
 * @experimental
 * Options for creating an {@link HTMLSource}. Configures how the source binds to its owning
 * canvas and when it repaints.
 * @example
 * ```ts
 * import { HTMLSource } from 'pixi.js/html-source';
 *
 * // Minimal: a live element that auto-updates every time the browser repaints it.
 * const source = new HTMLSource({ resource: domElement });
 *
 * // A continuously animated element you repaint yourself each frame.
 * const animatedSource = new HTMLSource({
 *     resource: domElement,
 *     autoRequestPaint: false, // call source.requestPaint() in your own ticker instead
 * });
 *
 * // A static one-shot capture that never listens for repaints.
 * const staticSource = new HTMLSource({
 *     resource: domElement,
 *     autoUpdate: false,
 * });
 * ```
 * @see {@link HTMLSource} For the texture source these options configure
 * @extends TextureSourceOptions
 * @category rendering
 * @advanced
 * @noInheritDoc
 */
export interface HTMLSourceOptions extends TextureSourceOptions<Element>
{
    /**
     * The canvas that owns this element's layout subtree. When omitted, this is inferred from
     * `resource.parentElement` when the resource is a direct canvas child.
     * @example
     * ```ts
     * // Inferred automatically — domElement is appended to the Pixi canvas.
     * app.canvas.appendChild(domElement);
     * const source = new HTMLSource({ resource: domElement });
     *
     * // Passed explicitly when inference is not possible.
     * const explicit = new HTMLSource({
     *     resource: domElement,
     *     canvas: app.canvas as HTMLSourceCanvas,
     * });
     * ```
     */
    canvas?: HTMLSourceCanvas;
    /**
     * Automatically set the `layoutsubtree` attribute on the owning canvas. The browser only
     * lays out and paints canvas children when this attribute is present.
     * @default true
     * @example
     * ```ts
     * // Opt out when you set `<canvas layoutsubtree>` yourself in markup.
     * const source = new HTMLSource({ resource: domElement, autoLayout: false });
     * ```
     */
    autoLayout?: boolean;
    /**
     * Listen for the owning canvas' `paint` event and update this source when the element is
     * repainted. Disable for a static, captured-once texture.
     * @default true
     * @example
     * ```ts
     * // Capture once, never track DOM changes — cheaper for static content.
     * const source = new HTMLSource({ resource: domElement, autoUpdate: false });
     * ```
     */
    autoUpdate?: boolean;
    /**
     * Request an initial paint after construction. Set to `false` and call
     * {@link HTMLSource.requestPaint} yourself each frame for continuous animations.
     * @default true
     * @example
     * ```ts
     * const source = new HTMLSource({ resource: domElement, autoRequestPaint: false });
     *
     * app.ticker.add(() => {
     *     source.requestPaint(); // drive repaints on your own schedule
     * });
     * ```
     */
    autoRequestPaint?: boolean;
}

function isCanvas(resource: unknown): resource is HTMLCanvasElement
{
    return !!globalThis.HTMLCanvasElement && resource instanceof HTMLCanvasElement;
}

/**
 * @experimental
 * A texture source backed by the experimental HTML-in-Canvas browser APIs. It renders a live
 * DOM {@link Element} into a texture you can use anywhere a normal texture works: on a
 * {@link Sprite}, as a {@link Texture} frame, in a mesh, and so on.
 *
 * The element keeps its native browser behavior while it is rendered: forms stay editable,
 * links stay clickable, and CSS animations keep running. PixiJS just mirrors its pixels into
 * the GPU each time the browser repaints it.
 *
 * The source resource must be a direct child of the renderer's `<canvas layoutsubtree>`
 * element. For an immutable, transferable copy that never repaints, use
 * {@link ElementImageSource} instead.
 *
 * > [!NOTE]
 * > This relies on an experimental browser proposal and requires the HTML-in-Canvas API to be
 * > enabled; without it the texture uploader throws on first render. A generic HTML element
 * > passed to `Texture.from` resolves to an `HTMLSource` only as a last resort (it has the
 * > lowest texture-source priority); construct it explicitly when you need options or
 * > non-HTML elements such as SVG.
 * @example
 * ```ts
 * import { Application, Sprite } from 'pixi.js';
 * import { HTMLSource } from 'pixi.js/html-source';
 *
 * const app = new Application();
 *
 * await app.init({ resizeTo: window });
 * document.body.appendChild(app.canvas);
 *
 * // The element must be a direct child of the Pixi canvas.
 * const form = document.createElement('form');
 *
 * form.innerHTML = '<input value="still editable" />';
 * app.canvas.appendChild(form);
 *
 * // Render the live form as a sprite. It stays interactive in the browser.
 * const source = new HTMLSource({ resource: form });
 * const sprite = Sprite.from(source);
 *
 * sprite.anchor.set(0.5);
 * sprite.position.set(app.screen.width / 2, app.screen.height / 2);
 * app.stage.addChild(sprite);
 * ```
 * @example
 * ```ts
 * // Continuous animation: drive repaints yourself each frame.
 * const source = new HTMLSource({ resource: animatedDiv, autoRequestPaint: false });
 * const sprite = Sprite.from(source);
 *
 * app.ticker.add(() => {
 *     sprite.rotation += 0.01;
 *     source.requestPaint(); // re-snapshot the DOM this frame
 * });
 * ```
 * @example
 * ```ts
 * // Slice the rendered element into sub-textures (e.g. a "shatter" effect).
 * import { Rectangle, Texture } from 'pixi.js';
 *
 * const pageSource = new HTMLSource({ resource: page });
 * const chunk = new Texture({
 *     source: pageSource,
 *     frame: new Rectangle(0, 0, 64, 64),
 * });
 * ```
 * @example
 * ```ts
 * // Auto-detected: a generic HTML element passed to Texture.from resolves to an HTMLSource
 * // when no other built-in source claims it. Prefer the explicit form for options.
 * const sprite = Sprite.from(divAlreadyInTheCanvas);
 * ```
 * @see {@link HTMLSourceOptions} For configuration options
 * @see {@link ElementImageSource} For an immutable snapshot instead of a live element
 * @see {@link Sprite} For displaying the source on screen
 * @see {@link Texture} For framing or slicing the source
 * @category rendering
 * @advanced
 */
export class HTMLSource extends TextureSource<Element>
{
    /**
     * Registers the source with the {@link extensions} system at the lowest texture-source
     * priority, so automatic detection only falls back to it when no other built-in source
     * claims the resource.
     */
    public static extension: ExtensionMetadata = {
        type: ExtensionType.TextureSource,
        priority: -10,
    };

    /**
     * The default options applied to every {@link HTMLSource}, merged with the options passed
     * to the constructor.
     * @example
     * ```ts
     * // Make every HTMLSource opt out of automatic repaint tracking by default.
     * HTMLSource.defaultOptions.autoUpdate = false;
     * ```
     */
    public static defaultOptions: Partial<HTMLSourceOptions> = {
        autoLayout: true,
        autoUpdate: true,
        autoRequestPaint: true,
    };

    /**
     * Tests whether a resource should be handled by `HTMLSource` during automatic source
     * detection (`Texture.from`, `TextureSource.from`). Deliberately strict: only generic HTML
     * elements pass. Image, video, and canvas elements are rejected because they have
     * dedicated, faster sources; snapshots are handled by {@link ElementImageSource}.
     * @param resource - The resource to test.
     * @returns `true` if this source can handle the resource.
     */
    public static test(resource: any): resource is Element
    {
        return !!globalThis.HTMLElement
            && resource instanceof HTMLElement
            && !(resource instanceof HTMLImageElement)
            && !(resource instanceof HTMLVideoElement)
            && !(resource instanceof HTMLCanvasElement);
    }

    /** The upload method for this texture. */
    public uploadMethodId = 'html';

    /**
     * Owning canvas used for `paint` events and {@link HTMLSource.requestPaint}. Set to `null`
     * once the source is destroyed.
     */
    public canvas: HTMLSourceCanvas | null;

    private readonly _autoUpdate: boolean;
    private _isReady: boolean;
    private readonly _onPaintBound: (event: Event & { changedElements?: Element[] }) => void;

    /**
     * @param options - Options for creating the HTML source. `resource` is required.
     * @example
     * ```ts
     * const source = new HTMLSource({
     *     resource: domElement,   // a direct child of the Pixi canvas
     *     autoUpdate: true,       // track browser repaints (default)
     *     autoRequestPaint: true, // request one initial paint (default)
     * });
     * ```
     */
    constructor(options: HTMLSourceOptions)
    {
        options = { ...HTMLSource.defaultOptions, ...options };

        if (!options.resource)
        {
            throw new Error('[HTMLSource] resource is required.');
        }

        super(options);

        const canvas = options.canvas ?? this._inferCanvas(options.resource);

        if (!canvas)
        {
            throw new Error(
                // eslint-disable-next-line max-len
                '[HTMLSource] Could not determine the owning canvas. Append the element to the canvas before constructing this source, or pass the `canvas` option.',
            );
        }

        if (options.resource.parentElement !== canvas)
        {
            throw new Error(
                // eslint-disable-next-line max-len
                '[HTMLSource] resource must be a direct child of the owning canvas. Append the element to the canvas before constructing this source.',
            );
        }

        this.canvas = canvas;
        this._autoUpdate = options.autoUpdate !== false;
        this._onPaintBound = this._onPaint.bind(this);

        // Without requestPaint (or with auto-update off) there is no first paint to wait for.
        this._isReady = !this._autoUpdate || !canvas.requestPaint;

        if (options.autoLayout !== false)
        {
            canvas.setAttribute('layoutsubtree', '');
        }

        if (this._autoUpdate)
        {
            canvas.addEventListener('paint', this._onPaintBound);
        }

        if (options.autoRequestPaint !== false)
        {
            this.requestPaint();
        }
    }

    /**
     * `true` once the owning canvas has produced an initial paint snapshot, so the texture has
     * real pixels. Non-auto-updating sources are ready immediately.
     * @example
     * ```ts
     * const source = new HTMLSource({ resource: domElement });
     *
     * if (!source.isReady)
     * {
     *     // The first paint has not landed yet — the texture is still blank.
     * }
     * ```
     */
    get isReady(): boolean
    {
        return this._isReady;
    }

    /**
     * Request a `paint` event from the owning canvas. Call this every frame to keep an animated
     * or frequently-changing element in sync with the rendered texture.
     * @returns `true` if the request was made, `false` when the browser lacks the experimental
     * `requestPaint` API or there is no owning canvas.
     * @example
     * ```ts
     * const source = new HTMLSource({ resource: clock, autoRequestPaint: false });
     *
     * app.ticker.add(() => {
     *     clock.textContent = new Date().toLocaleTimeString();
     *     source.requestPaint();
     * });
     * ```
     */
    public requestPaint(): boolean
    {
        if (!this.canvas?.requestPaint)
        {
            return false;
        }

        this.canvas.requestPaint();

        return true;
    }

    /**
     * Detaches the `paint` listener from the owning canvas and destroys the underlying texture
     * source.
     * @example
     * ```ts
     * const source = new HTMLSource({ resource: domElement });
     *
     * source.destroy();
     * ```
     */
    public destroy(): void
    {
        if (this.canvas && this._autoUpdate)
        {
            this.canvas.removeEventListener('paint', this._onPaintBound);
        }
        this.canvas = null;
        super.destroy();
    }

    /** Width in real pixels (`offsetWidth`). Use {@link width} for CSS pixels. */
    public get resourceWidth(): number
    {
        return (this.resource as HTMLElement).offsetWidth || 1;
    }

    /** Height in real pixels (`offsetHeight`). Use {@link height} for CSS pixels. */
    public get resourceHeight(): number
    {
        return (this.resource as HTMLElement).offsetHeight || 1;
    }

    private _inferCanvas(resource: Element): HTMLSourceCanvas | null
    {
        return isCanvas(resource.parentElement) ? (resource.parentElement as HTMLSourceCanvas) : null;
    }

    private _onPaint(event: Event & { changedElements?: Element[] }): void
    {
        const changedElements = event.changedElements;

        // A paint event can batch unrelated elements; only update when ours actually changed.
        if (changedElements?.length && !changedElements.includes(this.resource))
        {
            return;
        }

        this._isReady = true;
        this.update();
    }
}
