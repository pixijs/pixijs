import { type TestScene } from '../../../../types';
import { Assets } from '~/assets';
import { Texture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

export const scene: TestScene = {
    it: 'deeply nested cached render groups',
    options: {
        useBackBuffer: true,
        width: 64,
        height: 64,
        antialias: false,
    },
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        // Create 3 levels of nesting with alternating caching
        const level1 = new Container();
        const background1 = new Sprite({
            texture: Texture.WHITE,
            width: 64,
            height: 64,
            tint: 0xff0000
        });

        const level2 = new Container({ x: 10, y: 10 });
        const background2 = new Sprite({
            texture: Texture.WHITE,
            width: 42,
            height: 42,
            tint: 0x00ff00
        });

        const level3 = new Container();
        const bunny = new Sprite({ texture: bunnyTexture, x: 8, y: 3 });

        const overlay1 = new Graphics({ blendMode: 'overlay' })
            .rect(0, 0, 21, 21)
            .fill(0xff0000);

        const overlay2 = new Graphics({ blendMode: 'add' })
            .rect(21, 21, 21, 21)
            .fill(0x0000ff);

        level3.addChild(bunny, overlay1, overlay2);
        // Innermost cached
        level3.cacheAsTexture(true);

        // level2 not cached (middle layer)
        level2.addChild(background2, level3);

        level1.addChild(background1, level2);
        // Outermost cached
        level1.cacheAsTexture(true);
        level1.blendMode = 'exclusion';

        scene.addChild(level1);
    },
};
