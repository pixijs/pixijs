import { State, Texture, TextureSource } from '~/rendering';
import { Mesh, MeshGeometry, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should keep face culling correct when re-rendering the same texture with the other flipY',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const size = 56;
        const points = [0, 0, 1, 0, 0, 1, 1, 1];
        // one CCW (front, kept) + one CW (back, culled) triangle, as in the culling-flipy scene
        const indices = [
            2, 1, 0,
            2, 1, 3,
        ];

        const geometry = new MeshGeometry({
            positions: new Float32Array(points.map((p) => size * p)),
            uvs: new Float32Array(points),
            indices: new Uint32Array(indices),
        });

        const cullState = new State();

        cullState.culling = true;

        const mesh = new Mesh({ geometry });

        mesh.tint = 0xff0000;
        mesh.state = cullState;

        const capture = (firstFlipY: boolean, x: number): void =>
        {
            const texture = new Texture({ source: new TextureSource({ width: size, height: size }) });

            // the second render reuses the target with the other flipY, so the winding must follow it
            renderer.render({ container: mesh, target: texture, clear: true, flipY: firstFlipY });
            renderer.render({ container: mesh, target: texture, clear: true, flipY: !firstFlipY });

            const sprite = new Sprite(texture);

            sprite.position.set(x, (128 - size) / 2);
            scene.addChild(sprite);
        };

        capture(true, 8); // left: ends on the default capture
        capture(false, 64); // right: ends on the flipY capture
    },
};
