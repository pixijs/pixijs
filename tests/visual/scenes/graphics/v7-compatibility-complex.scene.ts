import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should graphics with v7 backwards compatible api',
    create: async (scene: Container) =>
    {
        const graphics = new Graphics();

        // set a fill and line style
        graphics.beginFill(0xFF3300);
        graphics.lineStyle(10, 0xffd900, 1);

        // draw a shape
        graphics.moveTo(50, 50);
        graphics.lineTo(250, 50);
        graphics.lineTo(100, 100);
        graphics.lineTo(250, 220);
        graphics.lineTo(50, 220);
        graphics.lineTo(50, 50);
        graphics.closePath();
        graphics.endFill();

        // set a fill and line style again
        graphics.lineStyle(10, 0xFF0000, 0.8);
        graphics.beginFill(0xFF700B, 1);

        // draw a second shape
        graphics.moveTo(210, 300);
        graphics.lineTo(450, 320);
        graphics.lineTo(570, 350);
        graphics.quadraticCurveTo(600, 0, 480, 100);
        graphics.lineTo(330, 120);
        graphics.lineTo(410, 200);
        graphics.lineTo(210, 300);
        graphics.closePath();
        graphics.endFill();

        // draw a rectangle
        graphics.lineStyle(2, 0x0000FF, 1);
        graphics.drawRect(50, 250, 100, 100);

        // draw a circle
        graphics.lineStyle(0);
        graphics.beginFill(0xFFFF0B, 0.5);
        graphics.drawCircle(470, 200, 100);
        graphics.endFill();

        // draw a line
        graphics.lineStyle(20, 0x33FF00);
        graphics.moveTo(30, 30);
        graphics.lineTo(600, 300);
        graphics.stroke(); // <- had to add this, should lineTo call stroke?

        // fit on scene
        scene.scale.set(0.15);

        scene.addChild(graphics);
    },
};
