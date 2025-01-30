import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container, TextureSpace } from '~/scene';

export const scene: TestScene = {
    it: 'should render rects with fills using textures',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>(`${basePath}textures/bunny.png`);
        const texture2 = await Assets.load<Texture>(`${basePath}textures/piece-newt-single.png`);

        const createGraphic = (type: TextureSpace, offsetX: number, offsetY: number, tex = texture) =>
        {
            const bg = new Graphics();
            const rect = new Graphics();

            rect.rect(offsetX, offsetY, 50, 50).fill({ texture: tex, textureSpace: type });
            bg.rect(offsetX, offsetY, 50, 50).fill(0xff0000);
            scene.addChild(bg, rect);
        };

        createGraphic('global', 0, 0);
        createGraphic('local', 55, 0);

        createGraphic('global', 0, 55, texture2);
        createGraphic('local', 55, 55, texture2);
    },
};
