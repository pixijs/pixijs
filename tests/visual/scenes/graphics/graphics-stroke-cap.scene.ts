import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke cap types: butt, round, square',
    create: async (scene: Container) =>
    {
        const caps = ['butt', 'round', 'square'] as const;
        const colors = [0xff0000, 0x00ff00, 0x0000ff];

        caps.forEach((cap, i) =>
        {
            const g = new Graphics();
            const yOffset = i * 30;

            g.moveTo(20, 30 + yOffset)
                .lineTo(108, 30 + yOffset)
                .stroke({
                    width: 15,
                    color: colors[i],
                    cap,
                });

            scene.addChild(g);
        });
    },
};
