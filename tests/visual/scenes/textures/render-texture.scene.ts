import { Assets } from '~/assets';
import { RenderTexture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render texture correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const texture = await Assets.load('profile-abel@0.5x.jpg');
        const bg = new Sprite(texture);

        scene.addChild(bg);

        bg.width = renderer.width;
        bg.height = renderer.height;

        const circle = new Graphics()
            .circle(0, 0, 50)
            .fill(0xFF0000);

        circle.x = 50;
        circle.y = 50;

        const rt = RenderTexture.create({ width: 100, height: 100 });

        renderer.render({
            target: rt,
            container: circle
        });

        const rtSprite = new Sprite(rt);

        rtSprite.anchor.set(0.5);
        rtSprite.position.set(bg.width / 2, bg.height / 2);

        scene.addChild(rtSprite);
    },
};
