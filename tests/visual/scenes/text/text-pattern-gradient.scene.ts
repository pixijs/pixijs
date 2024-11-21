import { loadTextures } from '../../../../src/assets/loader/parsers/textures/loadTextures';
import { FillGradient } from '../../../../src/scene/graphics/shared/fill/FillGradient';
import { FillPattern } from '../../../../src/scene/graphics/shared/fill/FillPattern';
import { Text } from '../../../../src/scene/text/Text';

import type { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render FillPattern and FillGradient in text stroke',
    only:  true,
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            x1: 1,
            y1: 0,
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 0.5, color: 0x00ff00 },
                { offset: 1, color: 0x0000ff },
            ],
        });

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
