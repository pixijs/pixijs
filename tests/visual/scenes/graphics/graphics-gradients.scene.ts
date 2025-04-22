import { Container, Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render gradients rects',
    create: async (scene: Container) =>
    {
        const width = 360;
        const height = 200;
        const spacing = 50;
        const colorStops = [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#00000000' },
        ];

        // Left to right, global coords - causes black line on right edge
        const gradient1 = new FillGradient({
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: width,
                y: 0,
            },
            colorStops,
            textureSpace: 'global',
        });
        const graphic1 = new Graphics()
            .rect(0, spacing, width, height)
            .fill(gradient1);

        // Left to right, local coords - works as expected
        const gradient2 = new FillGradient({
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 1,
                y: 0,
            },
            colorStops,
            textureSpace: 'local',
        });
        const graphic2 = new Graphics()
            .rect(0, height + (spacing * 2), width, height)
            .fill(gradient2);

        // Bottom to top, local coords - full black
        const gradient3 = new FillGradient({
            start: {
                x: 0,
                y: 1,
            },
            end: {
                x: 0,
                y: 0,
            },
            colorStops,
            textureSpace: 'local',
        });
        const graphic3 = new Graphics()
            .rect(width + (spacing * 2), spacing, width, height)
            .fill(gradient3);

        // Top to bottom, local coords - full black
        const gradient4 = new FillGradient({
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 0,
                y: 1,
            },
            colorStops,
            textureSpace: 'local',
        });
        const graphic4 = new Graphics()
            .rect(width + (spacing * 2), height + (spacing * 2), width, height)
            .fill(gradient4);

        const container = new Container();

        container.addChild(graphic1, graphic2, graphic3, graphic4);

        const bounds = container.getBounds();

        container.width = 128;
        container.height = 128;

        const scaleX = 128 / bounds.width;
        const scaleY = 128 / bounds.height;

        //  container.scale.set(scaleX, scaleY);
        container.x = -bounds.x * scaleX;
        container.y = -bounds.y * scaleY;

        scene.addChild(container);
    },
};
