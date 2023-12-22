import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { basePath } from '../../../assets/basePath';

import type { Container } from '../../../../src/scene/container/Container';
import type { Spritesheet } from '../../../../src/spritesheet/Spritesheet';
import type { TestScene } from '../../types';

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
