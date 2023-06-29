/* eslint-disable no-console */
import type { Renderer } from '../../../types';
import type { SystemRunner } from '../SystemRunner';

export function logRenderFlow(renderer: Renderer)
{
    console.log('Render Flow');

    ['prerender', 'renderStart', 'render', 'renderEnd', 'postrender'].forEach((runnerId) =>
    {
        logRunner(renderer.runners[runnerId]);
    });
}

function logRunner(runner: SystemRunner)
{
    console.log(` - ${runner.name}`);

    for (let i = 0; i < runner.items.length; i++)
    {
        console.log(`   ${i + 1}.`, runner.items[i].constructor.name || 'anonymous');
    }
}
