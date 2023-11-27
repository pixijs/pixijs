import { Container } from '../../../../src/scene/container/Container';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';

function drawBezier(x: number, y: number, bezierSmoothness: number)
{
    const bezier = new Graphics();

    bezier.fillStyle = 0x0000ff;
    bezier.beginPath();
    bezier.moveTo(11.5, 0);
    bezier.lineTo(52.5, 0);
    bezier.bezierCurveTo(58.25, 0, 64, 5.75, 64, 11.5, bezierSmoothness);
    bezier.lineTo(64, 52.5);
    bezier.bezierCurveTo(64, 58.25, 58.25, 64, 52.5, 64, bezierSmoothness);
    bezier.lineTo(11.5, 64);
    bezier.bezierCurveTo(5.75, 64, 0, 58.25, 0, 52.5, bezierSmoothness);
    bezier.lineTo(0, 11.5);
    bezier.bezierCurveTo(0, 5.75, 5.75, 0, 11.5, 0, bezierSmoothness);
    bezier.closePath();
    bezier.stroke({ color: 0xffffff, width: 1, alignment: 0 });
    bezier.fill();
    bezier.scale.set(5);
    bezier.position.set(x, y);

    return bezier;
}

export const scene: TestScene = {
    it: 'should render beziers with smoothness',
    create: async (scene: Container) =>
    {
        const root = new Container();

        const bezier1 = drawBezier(10, 10, 0); // smoothness = 0 (none)
        const bezier2 = drawBezier(20, 20, 0.5); // smoothness = 0.5 (default)
        const bezier3 = drawBezier(30, 30, 1); // smoothness = 1 (full)

        root.addChild(bezier1);
        root.addChild(bezier2);
        root.addChild(bezier3);

        scene.addChild(root);
    },
};
