import glob from 'glob';
import path from 'path';
import { renderTest } from './tester';

const paths = glob.sync('**/*.scene.ts', { cwd: path.join(process.cwd(), './tests') });

describe('Visual Tests', () =>
{
    for (let i = 0; i < paths.length; i++)
    {
        const file = paths[i];

        const relativePath = path.relative('visual/', file);
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const data = require(`./${relativePath}`).scene;

        const defaultRenderers = {
            canvas: false,
            webgl: true,
            webgpu: true
        };

        const renderers = {
            ...defaultRenderers,
            ...data.renderers
        };

        // eslint-disable-next-line no-loop-func
        Object.keys(renderers).forEach((renderer) =>
        {
            if (!renderers[renderer])
            {
                return;
            }

            it(`[${renderer}] - ${data.it}`, async () =>
            {
                jest.setTimeout(10000);
                if (data.skip)
                {
                    return;
                }

                const res = await renderTest(
                    data.id
                        || path.basename(file).toLowerCase().replaceAll('.', '-'), data.create,
                    renderer as 'canvas' | 'webgl' | 'webgpu',
                    data.options ?? {}
                );

                expect(res).toBeLessThanOrEqual(data.pixelMatch || 40);
            });
        });
    }
});
