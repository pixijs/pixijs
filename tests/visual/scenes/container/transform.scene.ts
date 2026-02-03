import { Assets } from '~/assets';
import { Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sprite',
    create: async (scene: Container) =>
    {
        scene.enableRenderGroup();

        const texture = await Assets.load(`bunny.png`);

        const sprite = Sprite.from(texture);

        sprite.x = 100;
        sprite.y = 100;

        const sprite2 = Sprite.from(texture);

        sprite2.x = 200;
        sprite2.y = 200;

        sprite2.rotation = 0.5;
        scene.addChild(sprite);
        scene.removeChild(sprite);

        const group = new Container();

        scene.addChild(group);
        group.scale = 0.5;
        group.x = 0;
        group.y = 0;

        group.addChild(sprite);
        group.addChild(sprite2);
    },
};
