import glob from 'glob';
import path from 'path';
import '~/environment-browser/browserAll';
import { isCI } from '../utils/basePath';
import { renderTest } from './tester';
import { Assets } from '~/assets';
import { TexturePool } from '~/rendering';

import type { RenderType, RenderTypeFlags } from './types';

const paths = glob.sync('**/*.scene.ts', { cwd: path.join(process.cwd(), './tests') });
const scenes = paths.map((p) =>
{
    const relativePath = path.relative('visual/', p);

    // eslint-disable-next-line global-require , @typescript-eslint/no-require-imports
    return { path: p, data: require(`./${relativePath}`).scene };
});

const onlyScenes = scenes.filter((s) =>
{
    if (isCI && s.data.only)
    {
        throw new Error(`only: true should not be committed to the repo. Please remove from ${path.basename(s.path)}`);
    }

    return s.data.only;
});

let scenesToTest = onlyScenes.length ? onlyScenes : scenes;

if (isCI)
{
    scenesToTest = scenesToTest.filter((s) => !s.data.skipCI);
}

function setAssetBasePath(): void
{
    const branchPath = process.env.GITHUB_SHA ?? 'next-v8';

    const basePath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${branchPath}/tests/visual/assets/`
        : 'http://127.0.0.1:8080/tests/visual/assets/';

    Assets.init({
        basePath
    }).catch((e) => console.error(e));
}

describe('Visual Tests', () =>
{
    scenesToTest.forEach((scene) =>
    {
        const id = scene.data.id || path.basename(scene.path).toLowerCase().replaceAll('.', '-');

        const defaultRenderers: RenderTypeFlags = {
            webgpu: true,
            webgl1: true,
            webgl2: true,
        };

        const renderers = {
            ...defaultRenderers,
            ...scene.data.renderers
        };

        Object.keys(renderers).forEach((renderer) =>
        {
            if (!renderers[renderer])
            {
                return;
            }

            it(`[${renderer}-${id}.png] - "${scene.data.it}" (${scene.path})`, async () =>
            {
                jest.setTimeout(process.env.DEBUG_MODE ? 10000000 : 10000);
                if (scene.data.skip)
                {
                    return;
                }

                TexturePool.clear();

                // reset assets each time..
                Assets.reset();
                setAssetBasePath();

                const pixelMatch = isCI ? scene.data.pixelMatch ?? 100 : scene.data.pixelMatchLocal ?? 100;

                const res = await renderTest(
                    id,
                    scene.data.create,
                    renderer as RenderType,
                    scene.data.options ?? {},
                    pixelMatch
                );

                expect(res).toBeLessThanOrEqual(pixelMatch);
            });
        });
    });
});
