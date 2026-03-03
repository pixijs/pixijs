import { Texture } from '~/rendering';
import { buildGeometryFromPath, GraphicsPath, Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render mesh with geometry build from custom path correctly',
    create: async (scene: Container) =>
    {
        const path = new GraphicsPath()
            .rect(0, 0, 64, 64)
            .rect(64, 64, 64, 64);

        const mesh = new Mesh({
            geometry: buildGeometryFromPath({ path }),
            texture: Texture.WHITE
        });

        scene.addChild(mesh);
    }
};
