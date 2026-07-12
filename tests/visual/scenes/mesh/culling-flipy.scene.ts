import { State, Texture, TextureSource } from '~/rendering';
import { Mesh, MeshGeometry, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should keep face culling correct when capturing with flipY (left: default, right: flipY)',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const size = 56;
        const points = [0, 0, 1, 0, 0, 1, 1, 1];
        // one CCW (front, kept) + one CW (back, culled) triangle — same winding setup as the
        // culling-texture scene. If the flipY winding weld is wrong on a backend, the culled
        // half survives instead, so the right-hand capture shows the OTHER triangle and diffs.
        const indices = [
            2, 1, 0, // CCW (front, kept)
            2, 1, 3, // CW  (back, culled)
        ];

        const geometry = new MeshGeometry({
            positions: new Float32Array(points.map((p) => size * p)),
            uvs: new Float32Array(points),
            indices: new Uint32Array(indices),
        });

        const cullState = new State();

        cullState.culling = true;

        const capture = (flipY: boolean, x: number): void =>
        {
            const mesh = new Mesh({ geometry });

            mesh.tint = 0xff0000;
            mesh.state = cullState;

            const texture = new Texture({ source: new TextureSource({ width: size, height: size }) });

            // flipY:true must flip the projection AND invert the winding together, so the SAME
            // face survives culling — just stored upright (no per-material flip needed for 3D).
            renderer.render({ container: mesh, target: texture, clear: true, flipY });

            const sprite = new Sprite(texture);

            sprite.position.set(x, (128 - size) / 2);
            scene.addChild(sprite);
        };

        capture(false, 8); // left: normal capture (control)
        capture(true, 64); // right: flipY capture — same triangle, stored upright
    },
};
