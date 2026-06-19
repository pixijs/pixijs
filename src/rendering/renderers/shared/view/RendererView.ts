import { Rectangle } from '../../../../maths/shapes/Rectangle';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { EventSystemFeatures } from '../../../../events/EventSystem';
import type { RenderTarget } from '../renderTarget/RenderTarget';
import type { CanvasSource } from '../texture/sources/CanvasSource';

/**
 * Options used to register a canvas with a renderer as an additional {@link RendererView}.
 *
 * Every field is optional; {@link ViewSystem.addView} fills in the renderer-level defaults
 * (resolution, autoDensity) and the per-view participation defaults before constructing the view.
 * @category rendering
 * @advanced
 */
export interface RendererViewOptions
{
    /** The canvas this view presents to. When omitted a fresh canvas is created. */
    canvas?: ICanvas;
    /** The resolution / device pixel ratio of the view. Defaults to the renderer's resolution. */
    resolution?: number;
    /**
     * Whether the canvas is resized in CSS pixels so it can be presented at resolutions other than 1.
     * Defaults to the renderer's autoDensity.
     */
    autoDensity?: boolean;
    /** Whether this view participates in the event system. Defaults to `true`. */
    events?: boolean;
    /** Whether this view participates in the accessibility system. Defaults to `true`. */
    accessibility?: boolean;
    /** Whether this view participates in DOM element rendering. Defaults to `true`. */
    dom?: boolean;
    /** Per-view overrides for the event system features. Merged by the event system. */
    eventFeatures?: Partial<EventSystemFeatures>;
    /**
     * Whether anti-aliasing is enabled for this view. Defaults to the renderer's antialias.
     * Affects WebGPU secondary canvases, which can be configured per surface.
     */
    antialias?: boolean;
    /**
     * Whether this view's canvas is transparent. Drives the WebGPU canvas `alphaMode` for secondary
     * canvases. Defaults to the renderer's background alpha being less than 1.
     */
    transparent?: boolean;
    /** Whether coordinates are rounded to whole pixels when rendering this view. Defaults to the renderer's roundPixels. */
    roundPixels?: boolean;
}

/**
 * A view is a single canvas a renderer presents to. The renderer always registers one view for its
 * main canvas, and {@link ViewSystem.addView} can register additional canvases so a single renderer
 * can drive several on-screen surfaces (multiView).
 *
 * This is a plain, dependency-light data holder: per-canvas systems (events, accessibility, DOM)
 * subscribe to the `viewAdded`/`viewRemoved` runners and key their per-canvas state off the view.
 * @category rendering
 * @advanced
 */
export class RendererView
{
    /** The canvas this view presents to. */
    public readonly canvas: ICanvas;
    /** The canvas source backing the canvas. */
    public readonly source: CanvasSource;
    /** The render target the renderer draws into when rendering to this view. */
    public readonly renderTarget: RenderTarget;
    /** Whether this is the renderer's own main canvas. */
    public readonly isMain: boolean;
    /** Whether this view participates in the event system. */
    public readonly events: boolean;
    /** Whether this view participates in the accessibility system. */
    public readonly accessibility: boolean;
    /** Whether this view participates in DOM element rendering. */
    public readonly dom: boolean;
    /** Per-view overrides for the event system features. */
    public readonly eventFeatures?: Partial<EventSystemFeatures>;
    /** Whether anti-aliasing is enabled for this view (relevant for WebGPU secondary canvases). */
    public readonly antialias: boolean;
    /** Whether this view's canvas is transparent (drives the WebGPU canvas alphaMode). */
    public readonly transparent: boolean;
    /** Whether coordinates are rounded to whole pixels when rendering this view. */
    public readonly roundPixels: boolean;

    /** Cached CSS-pixel viewport rectangle returned by {@link RendererView#screen}. */
    private readonly _screen: Rectangle;

    /**
     * @param options - A fully resolved description of the view. {@link ViewSystem.addView} applies
     *        all defaults before constructing, so every field is expected to be present.
     * @param options.canvas
     * @param options.source
     * @param options.renderTarget
     * @param options.isMain
     * @param options.events
     * @param options.accessibility
     * @param options.dom
     * @param options.eventFeatures
     * @param options.antialias
     * @param options.transparent
     * @param options.roundPixels
     */
    constructor(options: {
        canvas: ICanvas;
        source: CanvasSource;
        renderTarget: RenderTarget;
        isMain: boolean;
        events: boolean;
        accessibility: boolean;
        dom: boolean;
        eventFeatures?: Partial<EventSystemFeatures>;
        antialias?: boolean;
        transparent?: boolean;
        roundPixels?: boolean;
    })
    {
        this.canvas = options.canvas;
        this.source = options.source;
        this.renderTarget = options.renderTarget;
        this.isMain = options.isMain;
        this.events = options.events;
        this.accessibility = options.accessibility;
        this.dom = options.dom;
        this.eventFeatures = options.eventFeatures;
        this.antialias = !!options.antialias;
        this.transparent = !!options.transparent;
        this.roundPixels = !!options.roundPixels;

        this._screen = new Rectangle(0, 0, options.source.width, options.source.height);
    }

    /** The resolution / device pixel ratio of this view, derived from its canvas source. */
    public get resolution(): number
    {
        return this.source.resolution;
    }

    /**
     * Whether the canvas is resized in CSS pixels so it can be presented at resolutions other
     * than 1, derived from its canvas source.
     */
    public get autoDensity(): boolean
    {
        return this.source.autoDensity;
    }

    /**
     * The CSS-pixel viewport of this view, `(0, 0, source.width, source.height)`. Safe to use as a
     * filterArea or hitArea for the whole view. The same {@link Rectangle} instance is returned each
     * call, with its width/height refreshed from the canvas source.
     */
    public get screen(): Rectangle
    {
        this._screen.width = this.source.width;
        this._screen.height = this.source.height;

        return this._screen;
    }
}
