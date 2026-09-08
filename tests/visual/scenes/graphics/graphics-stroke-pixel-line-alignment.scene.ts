import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render pixelLine strokes with different alignments',
    create: async (scene: Container) =>
    {
        const alignments = [0, 0.5, 1] as const;
        const colors = [0xff0000, 0x00ff00, 0x0000ff];

        alignments.forEach((alignment, i) =>
        {
            const g = new Graphics();
            const yOffset = 10 + (i * 36);

            g.rect(20, yOffset, 88, 24)
                .stroke({
                    pixelLine: true,
                    color: colors[i],
                    alignment,
                });

            scene.addChild(g);
        });
    },
};
