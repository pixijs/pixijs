import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';
import type { WebGPURenderer } from '../../src/rendering/renderers/gpu/WebGPURenderer';

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

/**
 * Destroys the WebGPU device and resolves once the renderer has replaced it with a new one.
 * @param renderer - The renderer whose device to lose.
 */
export function loseAndRestoreDevice(renderer: WebGPURenderer): Promise<void>
{
    const restored = new Promise<void>((resolve) =>
    {
        const listener = {
            contextChange: () =>
            {
                renderer.runners.contextChange.remove(listener);
                resolve();
            },
        };

        renderer.runners.contextChange.add(listener);
    });

    renderer.gpu.device.destroy();

    return restored;
}
