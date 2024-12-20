import { Assets } from '~/assets';
import { NineSliceSprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a nine slice sprite correctly',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('big-rect-button-border.png');

        const nineSlice = new NineSliceSprite({
            texture,
            leftWidth: 26 * 2,
            rightWidth: 26 * 2,
            topHeight: 26 * 2,
            bottomHeight: 26 * 2,
        });

        scene.addChild(nineSlice);

        nineSlice.width = 128;
        nineSlice.height = 128;
    },
};
