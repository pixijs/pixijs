import type { Renderer, WebGPURenderer } from '~/rendering';

/**
 * Runs `render` with a WebGPU renderer treated as a tile-based GPU, so the MSAA restore path is exercised on
 * any machine, not only on tile-based GPUs (CI's is not). Other renderers just run `render`.
 * @param renderer - the renderer the scene draws with
 * @param render - the renders that create and reopen antialiased targets
 */
export function renderAsTileBased(renderer: Renderer, render: () => void): void
{
    const extensions = (renderer as WebGPURenderer).gpu ? (renderer as WebGPURenderer).device.extensions : null;
    const tileBased = extensions?.tileBased;

    if (extensions) extensions.tileBased = true;

    try
    {
        render();
    }
    finally
    {
        if (extensions) extensions.tileBased = tileBased;
    }
}
