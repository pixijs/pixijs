import { Assets } from '../../src/assets/Assets';
import { loadTextures } from '../../src/assets/loader/parsers/textures/loadTextures';
import { Culler } from '../../src/culling/Culler';
import { extensions } from '../../src/extensions/Extensions';
import { Container } from '../../src/scene/container/Container';
import { Sprite } from '../../src/scene/sprite/Sprite';
import { basePath } from '../assets/basePath';

import type { Texture } from '../../src/rendering/renderers/shared/texture/Texture';

describe('Culler', () =>
{
    extensions.add(loadTextures);
    let container: Container;
    let texture: Texture;
    const view = { x: 0, y: 0, width: 100, height: 100 };

    beforeAll(async () =>
    {
        await Assets.init({
            basePath,
        });
        texture = await Assets.load('textures/bunny.png');
    });

    afterAll(() =>
    {
        Assets.reset();
    });

    beforeEach(async () =>
    {
        Culler.shared = new Culler();
        container = new Container();
    });

    it('should cull from the list', () =>
    {
        const child = new Sprite(texture);

        child.x = 100;
        child.y = 100;
        child.width = 10;
        child.height = 10;
        child.cullable = true;
        container.addChild(child);

        Culler.shared.cull(container, view, false);

        expect(container.visible).toBe(true);
        expect(child.visible).toBe(false);
    });
});
