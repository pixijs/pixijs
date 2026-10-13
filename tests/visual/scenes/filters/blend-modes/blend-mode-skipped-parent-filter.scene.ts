import '~/advanced-blend-modes/init';
import { AlphaFilter } from '~/filters';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../../types';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should blend against the backdrop inside a parent whose filters are disabled',
    options: {
        useBackBuffer: true,
    },
    create: async (scene: Container) =>
    {
        const backdrop = new Graphics()
            .rect(0, 0, 64, 64)
            .fill(0xff0000)
            .rect(64, 0, 64, 64)
            .fill(0x00ff00)
            .rect(0, 64, 64, 64)
            .fill(0x0000ff)
            .rect(64, 64, 64, 64)
            .fill(0xffff00);
        const parent = new Container({ x: 30, y: 20 });
        const child = new Graphics().rect(25, 35, 40, 40).fill(0xffffff);
        const filter = new AlphaFilter();

        filter.enabled = false;
        parent.filters = [filter];
        child.blendMode = 'difference';
        parent.addChild(child);
        scene.addChild(backdrop, parent);
    },
};
