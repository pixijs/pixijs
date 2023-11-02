import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { basePath } from '../../../assets/basePath';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sprite',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);
        const spriteWithTextureConstructor = new Sprite(texture);
        const spriteWithTextureSetter = new Sprite();

        spriteWithTextureSetter.texture = texture;
        spriteWithTextureSetter.x = 100;

        scene.addChild(spriteWithTextureConstructor);
        scene.addChild(spriteWithTextureSetter);
    },
};
