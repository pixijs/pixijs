import '~/advanced-blend-modes/init';
import { Graphics } from '~/scene';

import type { TestScene } from '../../../types';
import type { BLEND_MODES } from '~/rendering';
import type { Container } from '~/scene';

const modes: BLEND_MODES[] = [
    'overlay', 'hard-light', 'soft-light', 'lighten',
    'darken', 'color-dodge', 'color-burn', 'difference',
];

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should blend semi-transparent layers with their own colour',
    options: {
        useBackBuffer: true,
    },
    create: async (scene: Container) =>
    {
        scene.addChild(new Graphics()
            .rect(0, 0, 128, 64)
            .fill(0x808080)
            .rect(0, 64, 128, 64)
            .fill(0x3366cc));

        modes.forEach((blendMode, i) =>
        {
            const x = ((i % 4) * 32) + 16;
            const y = (Math.floor(i / 4) * 64) + 32;
            const circle = new Graphics().circle(x, y, 14).fill(0xffcc33);

            circle.alpha = 0.5;
            circle.blendMode = blendMode;
            scene.addChild(circle);
        });
    },
};
