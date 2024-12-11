import { Assets } from '~/assets';
import { Point } from '~/maths';
import { Container, MeshRope } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render mesh rope',
    create: async (scene: Container) =>
    {
        // build a rope!
        const ropeLength = 918 / 20;

        const points: Point[] = [];

        for (let i = 0; i < 20; i++)
        {
            points.push(new Point(i * ropeLength, 0));
        }
        const texture = await Assets.load(`https://pixijs.com/assets/snake.png`);

        const strip = new MeshRope({
            texture,
            points
        });

        const snakeContainer = new Container();

        snakeContainer.scale.set(0.15);
        scene.addChild(snakeContainer);

        snakeContainer.addChild(strip);
        snakeContainer.y = 115;
        snakeContainer.angle = -45;

        const count = 0.1;

        // make the snake
        for (let i = 0; i < points.length; i++)
        {
            points[i].y = Math.sin((i * 0.5) + count) * 30;
            points[i].x = (i * ropeLength) + (Math.cos((i * 0.3) + count) * 20);
        }
    },
};
