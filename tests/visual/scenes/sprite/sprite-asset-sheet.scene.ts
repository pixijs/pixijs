import { basePath } from '@test-utils';
import { Assets } from '~/assets/Assets';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';
import type { Spritesheet } from '~/spritesheet/Spritesheet';

export const scene: TestScene = {
    it: 'should render from sprite sheets',
    create: async (scene: Container) =>
    {
        const spriteSheet = await Assets.load<Spritesheet>(`${basePath}spritesheet/spritesheet.json`);

        const bunnyTexture = spriteSheet.textures['bunny.png'];
        const senseiTexture = spriteSheet.textures['pic-sensei.jpg'];

        const bunnySprite = new Sprite(bunnyTexture);
        const senseiSprite = new Sprite(senseiTexture);

        senseiSprite.position.set(50, 50);

        scene.addChild(bunnySprite);
        scene.addChild(senseiSprite);
    },
};
