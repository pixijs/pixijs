import { Assets } from '../../../../src/assets/Assets';
import { MeshPlane } from '../../../../src/scene/mesh-plane/MeshPlane';
import { basePath } from '../../../assets/basePath';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render mesh plane',
    create: async (scene: Container, renderer) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);
        const texture2 = await Assets.load(`${basePath}textures/texture.png`);
        const rect = new MeshPlane({
            texture,
            verticesX: 100,
            verticesY: 100
        });

        scene.addChild(rect);

        renderer.render(scene);

        rect.texture = texture2;
    },
};
