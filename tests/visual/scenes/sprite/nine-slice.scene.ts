import { Assets } from '~/assets/Assets';
import { NineSliceSprite } from '~/scene/sprite-nine-slice/NineSliceSprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

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
