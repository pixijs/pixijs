import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';
import type { Spritesheet } from '~/spritesheet';

export const scene: TestScene = {
    it: 'should render from sprite sheets with "nearest" scale mode as a texture option',
    create: async (scene: Container) =>
    {
        const spriteSheet = await Assets.load<Spritesheet>({
            src: `${basePath}spritesheet/spritesheet.json`, data: {
                textureOptions: {
                    scaleMode: 'nearest'
                }
            }
        });

        const bunnyTexture = spriteSheet.textures['bunny.png'];

        const bunnySprite = new Sprite(bunnyTexture);

        bunnySprite.scale.set(10);

        scene.addChild(bunnySprite);
    },
};
