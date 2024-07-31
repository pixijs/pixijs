import { Assets } from '../../../../src/assets/Assets';
import { PerspectiveMesh } from '../../../../src/scene/mesh-perspective/PerspectiveMesh';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a perspective mesh',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`bg_scene_rotate.jpg`);

        const mesh = new PerspectiveMesh({
            texture,
            verticesX: 10,
            verticesY: 10,
            x0: 0,
            y0: 30,
            x1: 128,
            y1: 0,
            x2: 128,
            y2: 128,
            x3: 0,
            y3: 128 - 30,
        });

        scene.addChild(mesh);
    },
};
