import glob from 'glob';
import path from 'path';
import '~/environment-browser/browserAll';
import { isCI } from '../utils/basePath';
import { renderTest } from './tester';
import { Assets } from '~/assets';
import { TexturePool } from '~/rendering';

import type { RenderType, RenderTypeFlags, TestScene } from './types';

const sceneFilter = process.env.SCENE_FILTER;
const globPattern = sceneFilter ? `**/${sceneFilter}` : '**/*.scene.ts';
const paths = glob.sync(globPattern, { cwd: path.join(process.cwd(), './tests') });
const scenes = paths.map((p) =>
{
    const relativePath = path.relative('visual/', p);

    // eslint-disable-next-line global-require , @typescript-eslint/no-require-imports
    return { path: p, data: require(`./${relativePath}`).scene as TestScene };
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

    const serverPort = process.env.SERVER_PORT || '8080';

    const basePath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${branchPath}/tests/visual/assets/`
        : `http://127.0.0.1:${serverPort}/tests/visual/assets/`;

    Assets.init({
        basePath,
    }).catch((e) => console.error(e));
}

describe('Visual Tests', () =>
{
    scenesToTest.forEach((scene) =>
    {
        const id = scene.data.id || path.basename(scene.path).toLowerCase().replaceAll('.', '-');

        const isArray = Array.isArray(scene.data.renderers);
        const defaults = Object.fromEntries(
            // eslint-disable-next-line jest/expect-expect
            (['webgpu', 'webgl1', 'webgl2', 'canvas'] as RenderType[]).map((r) => [r, !isArray])
        ) as RenderTypeFlags;

        const renderers = {
            ...defaults,
            // eslint-disable-next-line jest/expect-expect
            ...(isArray ? (scene.data.renderers as RenderType[]).reduce((acc, r) =>
            {
                acc[r] = true;

                return acc;
            }, {} as Record<RenderType, boolean>) : scene.data.renderers),
            ...(scene.data.excludeRenderers?.reduce((acc, r) =>
            {
                acc[r] = false;

                return acc;
            }, {} as Record<RenderType, boolean>) ?? {}),
        };

        Object.keys(renderers).forEach((renderer) =>
        {
            if (!renderers[renderer as RenderType])
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

                const pixelMatch = isCI ? (scene.data.pixelMatch ?? 100) : (scene.data.pixelMatchLocal ?? 100);

                const res = await renderTest(
                    id,
                    scene.data.create,
                    renderer as RenderType,
                    scene.data.options ?? {},
                    pixelMatch,
                );

                expect(res).toBeLessThanOrEqual(pixelMatch);
            });
        });
    });
});
