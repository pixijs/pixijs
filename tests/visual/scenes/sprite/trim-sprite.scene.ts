import { Assets } from '../../../../src/assets/Assets';
import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a trimmed sprite',
    pixelMatch: 200,
    create: async (scene: Container) =>
    {
        await Assets.load(`trim-2.json`);

        const texture = Texture.from('reflection.png');

        const sprite = new Sprite(texture);

        scene.addChild(sprite);
    },
};
