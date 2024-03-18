import type { RenderTarget } from './RenderTarget';

/**
 * Checks if the render target is viewable on the screen
 * Basically, is it a canvas element and is that canvas element in the DOM
 * @param renderTarget - the render target to check
 * @returns true if the render target is viewable on the screen
 */
export function isRenderingToScreen(renderTarget: RenderTarget): boolean
{
    const resource = renderTarget.colorTexture.source.resource;

    return ((globalThis.HTMLCanvasElement && resource instanceof HTMLCanvasElement) && document.body.contains(resource));
}
