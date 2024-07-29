import { Point } from '../../../../src/maths/point/Point';
import { MeshRope } from '../../../../src/scene/mesh-simple/MeshRope';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should multiple textures on a complex mesh',
    pixelMatch: 200,
    create: async (scene: Container, renderer: Renderer) =>
    {
        const texture1 = renderer.canvasText.getTexture({
            text: 'Hello World',
            style: {
                fontFamily: 'Arial',
                fontSize: 50,
                fontWeight: '100',
                fill: 0xffffff,
            }
        });

        const texture2 = renderer.canvasText.getTexture({
            text: 'HELLO WORLD, HOW ARE YOU TODAY?',
            style: {
                fontSize: 50,
                fill: 'white',
            }
        });

        function createPoints(total: number, radius: number)
        {
            const points = [];

            for (let i = 0; i < total; i++)
            {
                const angle = ((i / total) * Math.PI * 2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                points.push(new Point(x, y));
            }

            return points;
        }

        // Create our mesh ropes.
        const strip = new MeshRope({ texture: texture1, points: createPoints(300, 200) });

        strip.x = 128 / 2;
        strip.y = 128 / 2;

        const strip2 = new MeshRope({ texture: texture2, points: createPoints(300, 250) });

        strip2.x = 128 / 2;
        strip2.y = 128 / 2;

        strip.scale.set(0.2);
        strip2.scale.set(0.2);
        scene.addChild(strip2);
        scene.addChild(strip);
    },
};
