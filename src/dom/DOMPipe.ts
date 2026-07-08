/* eslint-disable no-restricted-globals */
import { ExtensionType } from '../extensions/Extensions';
import { ViewTracker } from '../rendering/renderers/shared/view/ViewTracker';
import { CanvasObserver } from './CanvasObserver';

import type { InstructionSet } from '../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../rendering/renderers/shared/instructions/RenderPipe';
import type { RenderOptions } from '../rendering/renderers/shared/system/AbstractRenderer';
import type { RendererView } from '../rendering/renderers/shared/view/RendererView';
import type { TrackedViewData } from '../rendering/renderers/shared/view/ViewTracker';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';
import type { DOMContainer } from './DOMContainer';

/**
 * The per-canvas DOM overlay tracked by the {@link DOMPipe}. One view exists for the renderer's
 * main canvas and, under multiView, one for every additional canvas registered with the renderer.
 * Each overlay is kept aligned with its canvas by a {@link CanvasObserver}, so a DOM element always
 * sits over the canvas its scene was rendered to.
 * @internal
 */
interface DOMViewData extends TrackedViewData
{
    /** The container the DOM elements rendered to this canvas are appended to. */
    overlay: HTMLDivElement;
    /** Keeps the overlay aligned with the canvas's page position and scale. */
    observer: CanvasObserver;
    /** The container last rendered to this canvas; DOM elements under it belong to this overlay. */
    rootContainer: Container | null;
}

/**
 * The DOMPipe class is responsible for managing and rendering DOM elements within a PixiJS scene.
 * It maps dom elements to the canvas and ensures they are correctly positioned and visible.
 * @internal
 */
export class DOMPipe implements RenderPipe<DOMContainer>
{
    /**
     * Static property defining the extension type and name for the DOMPipe.
     * This is used to register the DOMPipe with different rendering pipelines.
     */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'dom',
    } as const;

    private _renderer: Renderer;

    /** Array to keep track of attached DOM elements */
    private readonly _attachedDomElements: DOMContainer[] = [];
    /** The main DOM element that acts as a container for the main canvas's DOM elements */
    private readonly _mainOverlay: HTMLDivElement;

    /** Per-canvas overlay bookkeeping; resolves the view a frame targets and its scene root. */
    private readonly _tracker: ViewTracker<DOMViewData>;

    /**
     * Constructor for the DOMPipe class.
     * @param renderer - The renderer instance that this DOMPipe will be associated with.
     */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;

        // the main overlay exists before init: the main view's viewAdded reuses it as its overlay
        this._mainOverlay = this._createOverlay();

        this._tracker = new ViewTracker<DOMViewData>({
            renderer,
            participates: (view) => view.dom,
            create: (view) => this._createViewData(view),
            destroy: (data) =>
            {
                data.overlay.remove();
                data.observer.destroy();
            },
        });

        // prerender resolves the (un-swapped) target view; postrender lays the dom elements out
        // after everything has been rendered
        this._renderer.runners.prerender.add(this);
        this._renderer.runners.postrender.add(this);

        // the view registry drives overlay creation/teardown; the main view is registered during
        // the renderer's init, so this overlay exists before viewAdded fires for it
        this._renderer.runners.viewAdded.add(this);
        this._renderer.runners.viewRemoved.add(this);
    }

    /** The html div element that holds all DOM Container elements for the main canvas. */
    public get _domElement(): HTMLDivElement
    {
        return this._tracker.mainView?.overlay ?? this._mainOverlay;
    }

    /**
     * Registers a per-canvas overlay for a newly added view. The main view reuses the public
     * {@link DOMPipe#_domElement} as its overlay; secondary views get a fresh one.
     * @param view - The view that was added to the renderer.
     */
    public viewAdded(view: RendererView): void
    {
        this._tracker.addFromView(view);
    }

    /**
     * Tears down the overlay for a removed view. The view registry owns removal, so per-source
     * destroy listeners are not needed here.
     * @param view - The view that was removed from the renderer.
     */
    public viewRemoved(view: RendererView): void
    {
        this._tracker.removeView(view);
    }

    /**
     * Adds a renderable DOM container to the list of attached elements.
     * @param domContainer - The DOM container to be added.
     * @param _instructionSet - The instruction set (unused).
     */
    public addRenderable(domContainer: DOMContainer, _instructionSet: InstructionSet): void
    {
        if (!this._attachedDomElements.includes(domContainer))
        {
            this._attachedDomElements.push(domContainer);
        }
    }

    /**
     * Updates a renderable DOM container.
     * @param _domContainer - The DOM container to be updated (unused).
     */
    public updateRenderable(_domContainer: DOMContainer): void
    {
        // Updates happen in postrender
    }

    /**
     * Validates a renderable DOM container.
     * @param _domContainer - The DOM container to be validated (unused).
     * @returns Always returns true as validation is not required.
     */
    public validateRenderable(_domContainer: DOMContainer): boolean
    {
        return true;
    }

    /**
     * Resolves the overlay this render targets (before any back-buffer swap), so postrender can lay
     * its DOM elements over the right canvas. Texture/offscreen targets resolve to no view.
     * @param options - the options the renderer was called with
     */
    public prerender(options: RenderOptions): void
    {
        this._tracker.setActive(options);
    }

    /** Lays out the DOM elements belonging to the canvas that was just rendered. */
    public postrender(): void
    {
        const attached = this._attachedDomElements;
        const view = this._tracker.consumeActive();

        // drop elements removed from the scene graph entirely, or hidden by their own visible/renderable
        // flags. Both signals are view-independent and always fresh (localDisplayStatus is written
        // synchronously by the visible/renderable setters), so they are safe to act on regardless of which
        // canvas rendered this frame. The cull bit (0b100) and ancestor visibility fold into
        // globalDisplayStatus, which is only valid for a scene that rendered this frame, so that check stays
        // gated per-view below.
        for (let i = 0; i < attached.length; i++)
        {
            const domContainer = attached[i];

            if (!domContainer.parent || (domContainer.localDisplayStatus & 0b011) !== 0b011)
            {
                domContainer.element?.remove();
                attached.splice(i, 1);
                i--;
            }
        }

        if (!view) return;

        const root = this._tracker.rootFor(view);

        for (let i = 0; i < attached.length; i++)
        {
            const domContainer = attached[i];

            if (!this._belongsToView(domContainer, root))
            {
                // it moved to another view's scene whose new owner has not rendered since; detach it
                // from THIS overlay (only ever our own children) so it does not ghost over this canvas.
                // Kept in `attached` so the new owning view re-parents it on its next render.
                if (domContainer.element?.parentNode === view.overlay)
                {
                    domContainer.element.remove();
                }

                continue;
            }

            // hidden or culled within its own scene, which has now rendered so the status is valid
            if (domContainer.globalDisplayStatus < 0b111)
            {
                domContainer.element?.remove();
                attached.splice(i, 1);
                i--;
                continue;
            }

            const element = domContainer.element;

            // re-parent into this view's overlay (also handles an element moving between canvases)
            if (element.parentNode !== view.overlay)
            {
                element.style.position = 'absolute';
                element.style.pointerEvents = 'auto';
                view.overlay.appendChild(element);
            }

            const wt = domContainer.worldTransform;
            const anchor = domContainer._anchor;
            const ax = domContainer.width * anchor.x;
            const ay = domContainer.height * anchor.y;

            element.style.transformOrigin = `${ax}px ${ay}px`;
            element.style.transform = `matrix(${wt.a}, ${wt.b}, ${wt.c}, ${wt.d}, ${wt.tx - ax}, ${wt.ty - ay})`;
            element.style.opacity = domContainer.groupAlpha.toString();
        }

        // an emptied overlay detaches itself; scoped per view so it never strips another canvas's overlay
        if (view.overlay.childElementCount === 0)
        {
            view.overlay.remove();
        }
        else
        {
            view.observer.ensureAttached();
        }
    }

    /**
     * Whether a DOM container's scene was rendered to a given root, by walking up to that root.
     * @param domContainer - the container to test
     * @param root - the scene root the rendered view captured
     */
    private _belongsToView(domContainer: DOMContainer, root: Container | null): boolean
    {
        if (!root) return false;

        let node: Container = domContainer;

        while (node)
        {
            if (node === root) return true;
            node = node.parent;
        }

        return false;
    }

    /**
     * Builds the per-canvas overlay + observer for a view; the main view reuses the main overlay.
     * @param view
     */
    private _createViewData(view: RendererView): DOMViewData
    {
        const overlay = view.isMain ? this._mainOverlay : this._createOverlay();
        const source = view.isMain ? null : view.source;

        return {
            overlay,
            observer: new CanvasObserver({
                domElement: overlay,
                renderer: this._renderer,
                source: source ?? undefined,
            }),
            rootContainer: null,
        };
    }

    /** Creates an absolutely positioned, click-through overlay container. */
    private _createOverlay(): HTMLDivElement
    {
        const overlay = document.createElement('div');

        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '1000';

        return overlay;
    }

    /** Destroys the DOMPipe, removing all attached DOM elements and cleaning up resources. */
    public destroy(): void
    {
        this._renderer.runners.prerender.remove(this);
        this._renderer.runners.postrender.remove(this);
        this._renderer.runners.viewAdded.remove(this);
        this._renderer.runners.viewRemoved.remove(this);

        for (let i = 0; i < this._attachedDomElements.length; i++)
        {
            this._attachedDomElements[i].element?.remove();
        }
        this._attachedDomElements.length = 0;

        this._tracker.destroyAll();

        this._renderer = null;
    }
}
