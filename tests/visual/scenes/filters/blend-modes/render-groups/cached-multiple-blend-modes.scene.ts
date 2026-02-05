import { type TestScene } from '../../../../types';
import { Assets } from '~/assets';
import { Texture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

export const scene: TestScene = {
    it: 'should render cached container with multiple blend modes applied to children',
    options: { useBackBuffer: true },
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        const container = new Container({ x: 64, y: 64 });
        const background = new Sprite({
            texture: Texture.WHITE,
            width: 60,
            height: 60,
            anchor: 0.5
        });

        background.tint = 0x444444;

        const bunny = new Sprite({ texture: bunnyTexture, anchor: 0.5 });

        const redCircle = new Graphics({ blendMode: 'overlay' })
            .circle(-6, -6, 12)
            .fill(0xff0000);

        const greenCircle = new Graphics({ blendMode: 'multiply' })
            .circle(6, -6, 12)
            .fill(0x00ff00);

        const blueCircle = new Graphics({ blendMode: 'screen' })
            .circle(0, 6, 12)
            .fill(0x0000ff);

        container.addChild(background, bunny, redCircle, greenCircle, blueCircle);
        container.cacheAsTexture(true);

        scene.addChild(container);
    }
};
