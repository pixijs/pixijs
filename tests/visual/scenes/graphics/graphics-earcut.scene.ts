import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render circles',
    create: async (scene: Container) =>
    {
        let yOffset = 0;

        function drawShape(step: number, color: string, closingPoint: boolean)
        {
            const shape = new Graphics();

            shape.moveTo(0, 200 + yOffset);
            for (let x = 0; x <= 200; x += step)
            {
                shape.lineTo(x, 200 + yOffset);
            }
            for (let x = 200; x <= 400; x += step)
            {
                shape.lineTo(x, 100 + yOffset);
            }
            shape.lineTo(400, 200 + yOffset);
            if (closingPoint)
            {
                shape.lineTo(0, 200 + yOffset);
            }
            shape
                .closePath()
                .fill({
                    color,
                    alpha: 1,
                })
                .stroke({
                    color: 'black',
                    width: 10,
                });
            shape.scale.set(0.25);
            scene.addChild(shape);
            yOffset += 150;
        }
        // Doesn't work
        drawShape(5, 'red', false);
    },
};
