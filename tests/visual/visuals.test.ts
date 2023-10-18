import glob from 'glob';
import path from 'path';
import { renderTest } from './tester';

const paths = glob.sync('**/*.scene.ts', { cwd: path.join(process.cwd(), './tests') });
const scenes = paths.map((p) =>
{
    const relativePath = path.relative('visual/', p);

    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return { path: p, data: require(`./${relativePath}`).scene };
});

const onlyScenes = scenes.filter((s) => s.data.only);
const scenesToTest = onlyScenes.length ? onlyScenes : scenes;

describe('Visual Tests', () =>
{
    scenesToTest.forEach((scene) =>
    {
        const defaultRenderers = {
            canvas: false,
            webgpu: true,
            webgl: true,
        };

        const renderers = {
            ...defaultRenderers,
            ...scene.data.renderers
        };

        // eslint-disable-next-line no-loop-func
        Object.keys(renderers).forEach((renderer) =>
        {
            if (!renderers[renderer])
            {
                return;
            }

            it(`[${renderer}] - ${scene.data.it}`, async () =>
            {
                jest.setTimeout(process.env.DEBUG_MODE ? 10000000 : 10000);
                if (scene.data.skip)
                {
                    return;
                }

                const res = await renderTest(
                    scene.data.id
                        || path.basename(scene.path).toLowerCase().replaceAll('.', '-'), scene.data.create,
                    renderer as 'canvas' | 'webgl' | 'webgpu',
                    scene.data.options ?? {}
                );

                expect(res).toBeLessThanOrEqual(scene.data.pixelMatch || 100);
            });
        });
    });
});
