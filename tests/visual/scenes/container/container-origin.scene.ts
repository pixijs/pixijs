import { Point } from '~/maths';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should apply origin correctly',
    options: {
        width: 256,
        height: 256,
    },
    create: async (scene: Container) =>
    {
        const container = new Container();

        scene.addChild(container);

        // Create a rectangle
        const rectWidth = 75;
        const rectHeight = 50;
        const rect = new Graphics()
            .rect(0, 0, rectWidth, rectHeight)
            .fill(0x3498db)
            .stroke({ width: 4, color: 'black' });

        container.addChild(rect);

        // Crosshair to show origin
        const originMarker = new Graphics()
            .moveTo(-10, 0)
            .lineTo(10, 0)
            .moveTo(0, -10)
            .lineTo(0, 10)
            .stroke({ width: 4, color: 0xff0000 });

        container.addChild(originMarker);
        container.addChild(originMarker);

        // Position marker to show container position
        const positionMarker = new Graphics()
            .circle(0, 0, 8)
            .fill('red')
            .circle(0, 0, 3)
            .fill(0xffffff);

        positionMarker.position.set(100);
        scene.addChild(positionMarker);

        // Position the container at center
        container.position.set(100);

        const origin = new Point(rectWidth / 2, rectHeight / 2);

        container.origin.copyFrom(origin);
        originMarker.position.copyFrom(origin);

        // Set the container size
        container.scale.set(2, 2);

        // make a clone of the container
        const containerClone = new Container();

        containerClone.position.set(100);
        containerClone.scale.set(2, 2);
        containerClone.addChild(rect.clone(true));
        containerClone.tint = 'red';
        scene.addChildAt(containerClone, 0);
    },
};
