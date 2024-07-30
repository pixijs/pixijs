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
            x1: 0,
            y1: 30,
            x2: 128,
            y2: 0,
            x3: 128,
            y3: 128,
            x4: 0,
            y4: 128 - 30,
        });

        scene.addChild(mesh);
    },
};
