import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should min blend correctly',
    create: async (scene: Container) =>
    {
        const yellow = new Graphics().rect(0, 0, 100, 100).fill(0xffff00);
        const magenta = new Graphics().rect(0, 0, 100, 100).fill(0x00ffff);

        magenta.blendMode = 'min';

        scene.addChild(yellow, magenta);
    },
};
