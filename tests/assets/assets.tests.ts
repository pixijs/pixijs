import { Assets } from '../../src/assets/Assets';
import { loadTextures } from '../../src/assets/loader/parsers/textures/loadTextures';
import { extensions } from '../../src/extensions/Extensions';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';

describe('Assets', () =>
{
    const basePath = process.env.GITHUB_ACTIONS
        ? `https://raw.githubusercontent.com/pixijs/pixijs/${process.env.GITHUB_SHA}/tests/assets/assets/`
        : 'http://localhost:8080/tests/assets/assets/';

    beforeEach(() =>
    {
        // reset the loader
        Assets.reset();
    });

    it('should load assets', async () =>
    {
        extensions.add(loadTextures);
        await Assets.init({
            basePath,
        });

        const bunny = await Assets.load('textures/bunny.png');
        const bunny2 = await Assets.load({
            src: 'textures/bunny.png'
        });

        expect(bunny).toBeInstanceOf(Texture);
        expect(bunny2).toBeInstanceOf(Texture);
    });
});
