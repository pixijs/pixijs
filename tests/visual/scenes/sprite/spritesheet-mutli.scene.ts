import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';
import type { Spritesheet } from '~/spritesheet';

export const scene: TestScene = {
    it: 'should load a sprite from multi packed spritesheet with "nearest" scale mode as a texture option',
    create: async (scene: Container) =>
    {
        await Assets.load<Spritesheet>({
            src: `${basePath}spritesheet/multi-pack-0.json`, data: {
                textureOptions: {
                    scaleMode: 'nearest'
                }
            }
        });

        const goldmineSprite = Sprite.from('goldmine_10_5.png');

        goldmineSprite.scale.set(3);
        goldmineSprite.anchor.set(0.5);

        scene.addChild(goldmineSprite);
    },
};
