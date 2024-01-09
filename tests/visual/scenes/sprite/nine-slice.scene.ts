import { Assets } from '../../../../src/assets/Assets';
import { NineSliceSprite } from '../../../../src/scene/sprite-nine-slice/NineSliceSprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a nine slice sprite correctly',
    only: true,
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
