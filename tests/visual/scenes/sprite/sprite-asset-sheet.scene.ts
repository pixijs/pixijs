import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';
import type { Spritesheet } from '~/spritesheet';

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
