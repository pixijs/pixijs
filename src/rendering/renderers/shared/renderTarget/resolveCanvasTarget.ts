import { CanvasSource } from '../texture/sources/CanvasSource';

import type { Renderer } from '../../types';
import type { RenderOptions } from '../system/AbstractRenderer';

/**
 * The on-screen canvas a render targeted, as resolved from its render options.
 * @internal
 */
export interface ResolvedCanvasTarget
{
    /** The canvas rendered to. */
    element: HTMLCanvasElement;
    /** The canvas source backing the element, or null for the renderer's own (main) canvas. */
    source: CanvasSource | null;
    /** Whether this is the renderer's own canvas. */
    isMain: boolean;
}

/**
 * Resolves the on-screen canvas a render targeted, so per-canvas systems (events, DOM, accessibility)
 * can attach their overlays to the right canvas under multiView. Returns null for offscreen targets
 * (render textures, detached or OffscreenCanvas surfaces), which have no overlay.
 *
 * Call this from a `prerender` hook: a system such as the back buffer swaps `options.target` in
 * `renderStart`, so the original target is only reliable before then.
 * @param renderer - the renderer the render ran on
 * @param options - the options the renderer was called with
 * @internal
 */
export function resolveCanvasTarget(renderer: Renderer, options: RenderOptions): ResolvedCanvasTarget | null
{
    // main view fast path - the renderer's own canvas, no render target lookup needed
    if (options.target === renderer.view.renderTarget)
    {
        return { element: renderer.view.canvas as unknown as HTMLCanvasElement, source: null, isMain: true };
    }

    const source = renderer.renderTarget.getRenderTarget(options.target).colorTexture;

    // only on-screen canvases get an overlay; texture targets are skipped
    if (!(source instanceof CanvasSource)) return null;

    const element = source.resource as unknown as HTMLCanvasElement;

    // the renderer's own canvas passed explicitly as a target still maps to the main view
    if (element === (renderer.view.canvas as unknown as HTMLCanvasElement))
    {
        return { element, source: null, isMain: true };
    }

    // canvases not in the document (offscreen scratch targets) have no layout box to align with
    if (!element || !element.isConnected) return null;

    return { element, source, isMain: false };
}
