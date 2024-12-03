import { AlphaFilter } from '@/filters/defaults/alpha/AlphaFilter';
import { BlurFilter } from '@/filters/defaults/blur/BlurFilter';
import { ColorMatrixFilter } from '@/filters/defaults/color-matrix/ColorMatrixFilter';
import { Graphics } from '@/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';

export const scene: TestScene = {
    it: 'should render filters correctly with antialiasing',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.rect(0, 0, 100, 100);
        g.fill({ color: 0xffff00 });
        g.circle(50, 50, 30);
        g.fill('red');

        g.position.set((128 / 2) - (100 / 2));

        const blurFilter = new BlurFilter({ antialias: true });
        const alphaFilter = new AlphaFilter({ alpha: 0.5, antialias: true });
        const colorFilter = new ColorMatrixFilter({ antialias: true });

        colorFilter.greyscale(0.5, true);
        g.filters = [blurFilter, colorFilter, alphaFilter];

        scene.addChild(g);
    },
};
