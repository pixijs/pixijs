import { Color } from '../../../../src/color/Color';
import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render alpha mask',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        const masky = new Sprite(Texture.WHITE);

        masky.width = 50;
        masky.height = 50;

        masky.anchor.set(0.5);

        masky.position.set(128 / 2);

        rect.mask = masky;

        scene.addChild(rect);
        scene.addChild(masky);
    },
};
