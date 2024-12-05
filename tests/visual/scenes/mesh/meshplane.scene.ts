import { basePath } from '@test-utils';
import { Assets } from '~/assets/Assets';
import { MeshPlane } from '~/scene/mesh-plane/MeshPlane';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

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
