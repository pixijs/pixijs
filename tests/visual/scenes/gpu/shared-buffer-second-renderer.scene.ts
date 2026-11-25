import { autoDetectRenderer, Texture } from '~/rendering';
import { Mesh, MeshGeometry } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

// Two WebGPU renderers draw one geometry, then a ranged update fills in its right-hand quad, the way a mesh
// packed into a shared vertex buffer arrives. The extra renderer drew first, so it handles the update first;
// the harness renderer must still draw both quads.
export const scene: TestScene = {
    it: 'should draw a ranged geometry update in every renderer that holds the geometry',
    renderers: ['webgpu'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const geometry = new MeshGeometry({
            // the right-hand quad starts collapsed to a point, so it draws nothing
            positions: new Float32Array([
                16, 44, 56, 44, 56, 84, 16, 84,
                0, 0, 0, 0, 0, 0, 0, 0,
            ]),
            uvs: new Float32Array(16),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]),
        });

        // a batched mesh draws from the batcher's copy of its vertices, not from the geometry's buffer
        geometry.batchMode = 'no-batch';

        const mesh = new Mesh({ geometry, texture: Texture.WHITE });
        const other = await autoDetectRenderer({ preference: 'webgpu', width: 128, height: 128 });

        other.render(mesh);
        renderer.render(mesh);

        geometry.positions.set([72, 44, 112, 44, 112, 84, 72, 84], 8);
        geometry.getBuffer('aPosition').update(32, 32);

        other.destroy();
        scene.addChild(mesh);
    },
};
