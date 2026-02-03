import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

function drawCurve(
    root: Container,
    x: number,
    y: number,
    width: number,
    height: number,
    smoothness: number,
    thickness: number,
)
{
    const startX = x;
    const startY = y + height;
    const endX = x + width;
    const endY = y + height;
    const cpX = startX + (width / 2);
    const cpY = y - thickness;

    const bezierA = new Graphics();

    bezierA.moveTo(startX, startY);
    bezierA.quadraticCurveTo(cpX, cpY, endX, endY, smoothness);
    bezierA.moveTo(endX, endY);
    bezierA.stroke({ color: 0xff0000, width: thickness, alignment: 0 });
    bezierA.position.set(x, y);

    const bezierB = new Graphics();

    bezierB.moveTo(startX, startY);
    bezierB.bezierCurveTo(cpX, cpY, cpX, cpY, endX, endY, smoothness);
    bezierB.moveTo(endX, endY);
    bezierB.stroke({ color: 0x00ff00, width: thickness, alignment: 0 });
    bezierB.position.set(x, y);

    root.addChild(bezierB);
    root.addChild(bezierA);
}

export const scene: TestScene = {
    it: 'should render beziers with smoothness',
    create: async (scene: Container) =>
    {
        const root = new Container();

        const thickness = 10;
        const width = 22;
        const height = 128;

        const rect = new Graphics();

        rect.fillStyle = 0x666666;
        rect.rect(0, 0, 128, 128);
        rect.fill();
        root.addChild(rect);

        drawCurve(
            root,
            thickness * 0.5, 0,
            width, height,
            0 /** no smoothness */, thickness,
        );

        drawCurve(
            root,
            (thickness * 0.5) + (width), 0,
            width, height,
            0.5 /** mid smoothness (default) */, thickness,
        );

        drawCurve(
            root,
            (thickness * 0.5) + (width * 2), 0,
            width, height,
            1 /** full smoothness */, thickness,
        );

        scene.addChild(root);
    },
};
