import { Texture } from '../../../../src';
import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a trimmed sprite',
    only: true,
    pixelMatch: 200,
    create: async (scene: Container) =>
    {
        await Assets.load(`trim-2.json`);

        const texture = Texture.from('reflection.png');

        const sprite = new Sprite(texture);

        scene.addChild(sprite);
    },
};
