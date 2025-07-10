import { Assets } from '~/assets';
import { Color } from '~/color';
import { Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should correct render trimed alpha mask correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        rect.width = 100;
        rect.height = 100;

        const texture = await Assets.load('blurredCircle.png') as Texture;
        const trimedTexture = new Texture({
            source: texture.source,
            frame: new Rectangle(0, 0, 200, 200),
            orig: new Rectangle(0, 0, 400, 300),
            trim: new Rectangle(100, 100, 200, 200)
        });
        const mask = new Sprite(trimedTexture);

        mask.width = 40;
        mask.height = 30;

        mask.anchor.set(0.5);

        mask.position.set(128 / 2);

        rect.mask = mask;
        rect.setMask({
            inverse: true,
        });

        scene.addChild(rect);
        scene.addChild(mask);
    },
};
