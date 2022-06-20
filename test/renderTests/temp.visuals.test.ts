import { renderTest } from '.';
import fs from 'fs';
import path from 'path';
import { extensions, BatchRenderer } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { AccessibilityManager } from '@pixi/accessibility';
import { InteractionManager } from '@pixi/interaction';
import { Prepare } from '@pixi/prepare';
import { ParticleRenderer } from '@pixi/particle-container';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { BitmapFontLoader } from '@pixi/text-bitmap';
import { CompressedTextureLoader, DDSLoader, KTXLoader } from '@pixi/compressed-textures';
import { SpritesheetLoader } from '@pixi/spritesheet';
import { TickerPlugin } from '@pixi/ticker';
import { AppLoaderPlugin } from '@pixi/loaders';

const suites = process.env.TEST_SUITES;
const availableSuites = suites.split(',');

for (const pkg of availableSuites)
{
    beforeAll(() => extensions.add(
        AccessibilityManager,
        Extract,
        InteractionManager,
        ParticleRenderer,
        Prepare,
        BatchRenderer,
        TilingSpriteRenderer,
        BitmapFontLoader,
        CompressedTextureLoader,
        DDSLoader,
        KTXLoader,
        SpritesheetLoader,
        TickerPlugin,
        AppLoaderPlugin
    ));
    afterAll(() => extensions.remove(
        AccessibilityManager,
        Extract,
        InteractionManager,
        ParticleRenderer,
        Prepare,
        BatchRenderer,
        TilingSpriteRenderer,
        BitmapFontLoader,
        CompressedTextureLoader,
        DDSLoader,
        KTXLoader,
        SpritesheetLoader,
        TickerPlugin,
        AppLoaderPlugin
    ));

    describe(pkg, () =>
    {
        const filtered = fs.readdirSync(pkg)
            .filter((file) => file.endsWith('.scene.ts'));
        const paths = filtered.map((file) => path.join(pkg, file));

        for (let i = 0; i < paths.length; i++)
        {
            const file = paths[i];
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
            const data = require(file).scene;

            it(data.it, async () =>
            {
                if (data.skip)
                {
                    return;
                }

                const res = await renderTest(
                    data.id
                    || file.split(`${pkg}/`)[1].toLowerCase().replaceAll('.', '-'), data.create,
                    data.options ?? {}
                );

                expect(res).toBeLessThanOrEqual(data.pixelMatch || 40);
            });
        }
    });
}
