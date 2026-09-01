import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

/**
 * Forces a WebGL context loss and resolves once the renderer has restored the context.
 * @param renderer - The renderer whose context to lose.
 */
export function loseAndRestoreContext(renderer: WebGLRenderer): Promise<void>
{
    if (!renderer.context.extensions.loseContext)
    {
        throw new Error('WEBGL_lose_context is not available, cannot force a context loss');
    }

    const restored = new Promise<void>((resolve) =>
    {
        renderer.canvas.addEventListener('webglcontextrestored', () => resolve(), { once: true });
    });

    renderer.context.forceContextLoss();

    return restored;
}
