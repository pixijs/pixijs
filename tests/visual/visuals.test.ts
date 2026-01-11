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

const canvasExcludedScenes = new Set([
    'alpha-filter.scene.ts',
    'alpha-inverse-mask.scene.ts',
    'alpha-mask-cache-as-texture.scene.ts',
    'alpha-mask.scene.ts',
    'blend-mode-max.scene.ts',
    'blend-mode-min.scene.ts',
    'blend-mode-render-texture.scene.ts',
    'circle-mask.scene.ts',
    'culling-texture.scene.ts',
    'custom-mesh-instanced.scene.ts',
    'custom-mesh.scene.ts',
    'dds.scene.ts',
    'filter-render-textures.scene.ts',
    'fully-custom-mesh.scene.ts',
    'geometry-from-path.scene.ts',
    'ktx.scene.ts',
    'layer-mask.scene.ts',
    'mask-out-of-viewport.scene.ts',
    'mesh-textures.scene.ts',
    'meshplane.scene.ts',
    'meshrope.scene.ts',
    'msdf-text.scene.ts',
    'multiple-render-targets.scene.ts',
    'nested-container.scene.ts',
    'nested-mask.scene.ts',
    'particle.scene.ts',
    'perspective-mesh.scene.ts',
    'restore-context.scene.ts',
    'sdf-text.scene.ts',
    'sprite-sheet-mesh.scene.ts',
    'stencil-inverse-mask.scene.ts',
    'stencil-mask.scene.ts',
    'stencil-nested-render-group.scene.ts',
    'text-bounds.scene.ts',
    'triangle.scene.ts',
    'trimed-sprite-mask.scene.ts',
]);

function isCanvasCompatible(scenePath: string): boolean
{
    const sceneName = path.basename(scenePath);

    return !canvasExcludedScenes.has(sceneName);
}

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
            canvas: true,
        };

        const renderers = {
            ...defaultRenderers,
            ...scene.data.renderers
        };

        if (!isCanvasCompatible(scene.path))
        {
            renderers.canvas = false;
        }

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
