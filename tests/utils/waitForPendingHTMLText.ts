import type { Renderer } from '../../src/rendering/renderers/types';
import type { Container } from '../../src/scene/container/Container';
import type { BatchableHTMLText } from '../../src/scene/text-html/BatchableHTMLText';

/**
 * After `renderer.render()`, HTMLText asynchronously generates its texture (font fetch,
 * SVG image load). On slow CI runs this can outlast a fixed `setTimeout` in the scene,
 * causing extract.canvas to read an empty texture and produce a flaky pixel diff. This
 * walks the container and awaits every in-flight HTMLText texture promise so extraction always
 * sees the resolved texture.
 * @param container - The container (or HTMLText) to wait for.
 * @param renderer - The renderer the texts were rendered with.
 */
export async function waitForPendingHTMLText(container: Container, renderer: Renderer): Promise<void>
{
    const promises: Promise<unknown>[] = [];

    const visit = (c: Container): void =>
    {
        if (c.renderPipeId === 'htmlText')
        {
            const gpuData = (c as unknown as { _gpuData: Record<number, BatchableHTMLText> })
                ._gpuData[renderer.uid];

            if (gpuData?.texturePromise) promises.push(gpuData.texturePromise.catch((): undefined => undefined));
        }

        c.children.forEach(visit);
    };

    visit(container);

    await Promise.all(promises);
}
