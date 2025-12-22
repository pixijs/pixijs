import { readFileSync } from 'fs';
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

const canvasUnsupportedPathParts = [
    '/scenes/filters/',
    '/scenes/blend-modes/',
    '/scenes/mask/',
    '/scenes/mesh/',
    '/scenes/particle/',
    '/scenes/compressed-textures/',
];
const canvasUnsupportedPatterns = [
    /from ['"]~\/filters/,
    /\.filters\b/,
    /\bfilters\s*:/,
    /\.mask\b/,
    /\bmask\s*:/,
    /\bMask\b/,
    /Filter\b/,
    /\bMesh\b/,
    /\bTilingSprite\b/,
    /\bNineSliceSprite\b/,
    /\bParticleContainer\b/,
    /\bParticle\b/,
    /\bHTMLText\b/,
    /\bHTMLTextStyle\b/,
];

function isCanvasCompatible(scenePath: string): boolean
{
    const normalized = scenePath.replace(/\\/g, '/');

    for (let i = 0; i < canvasUnsupportedPathParts.length; i++)
    {
        if (normalized.includes(canvasUnsupportedPathParts[i]))
        {
            return false;
        }
    }

    const source = readFileSync(path.join(process.cwd(), 'tests', scenePath), 'utf8');

    for (let i = 0; i < canvasUnsupportedPatterns.length; i++)
    {
        if (canvasUnsupportedPatterns[i].test(source))
        {
            return false;
        }
    }

    return true;
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
