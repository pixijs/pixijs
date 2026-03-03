import { ColorMatrixFilter } from '~/filters';
import { State } from '~/rendering';
import { Mesh, MeshGeometry } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should cull correctly when rendering to a texture',
    create: async (scene: Container) =>
    {
        const points = [0, 0, 1, 0, 0, 1, 1, 1];
        // Make triangles, one normal facing, one reverse
        const triangles = [
            2, 1, 0, // CCW (front)
            2, 1, 3 // CW (back, should get culled)
        ];

        const geometry = new MeshGeometry({
            positions: new Float32Array(points.map((p) => 100 * p)),
            uvs: new Float32Array(points),
            indices: new Uint32Array(triangles),
        });

        // Create state that has face culling enabled
        const faceCullState = new State();

        faceCullState.culling = true;

        // Expected mesh
        const mesh = new Mesh({
            geometry,
        });

        mesh.tint = 0xff0000;
        mesh.state = faceCullState;
        mesh.x = 0;
        mesh.y = 0;
        scene.addChild(mesh);

        // Mesh with filter applied
        const mesh2 = new Mesh({
            geometry,
        });

        mesh2.tint = 0xff0000;
        mesh2.state = faceCullState;
        mesh2.x = 10;
        mesh2.y = 10;

        const filter = new ColorMatrixFilter();

        filter.brightness(0.5, true);
        mesh2.filters = [filter];

        scene.addChild(mesh2);
    },
};
