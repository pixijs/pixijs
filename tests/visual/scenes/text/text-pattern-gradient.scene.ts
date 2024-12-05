import { loadTextures } from '~/assets/loader/parsers/textures/loadTextures';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';
import { Text } from '~/scene/text/Text';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering/renderers/shared/texture/Texture';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render FillPattern and FillGradient in text stroke',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient(0, 0, 110, 0)
            .addColorStop(0, 0xff0000)
            .addColorStop(0.5, 0x00ff00)
            .addColorStop(1, 0x0000ff);
        const textGradient = new Text({
            text: 'PixiJS',
            style: {
                fontSize: 36,
                fill: 0xffffff,
                stroke: { fill: gradient, width: 10 },
            },
        });

        const txt = await loadTextures.load<Texture>('https://pixijs.com/assets/bg_scene_rotate.jpg', {}, null);
        const pat = new FillPattern(txt, 'repeat');

        const textPattern = new Text({
            text: 'PixiJS',
            style: {
                fontSize: 36,
                fill: 0xffffff,
                stroke: { fill: pat, width: 10 },
            },
        });

        textPattern.y = (textGradient.height);

        scene.addChild(textGradient, textPattern);
    },
};
