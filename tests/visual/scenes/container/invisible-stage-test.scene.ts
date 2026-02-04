import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should demonstrate stage visibility fix - invisible stage should render nothing',
    create: async (scene: Container) =>
    {
        // This test specifically demonstrates our visibility fix
        // When stage.visible = false, nothing should be rendered

        // Create a colorful background that should NOT appear when stage is invisible
        const background = new Graphics()
            .rect(0, 0, 400, 300)
            .fill(0xff0000); // Bright red - should be invisible due to stage.visible = false

        scene.addChild(background);

        // Add some prominent graphics that should also be invisible
        const bigCircle = new Graphics()
            .circle(200, 150, 80)
            .fill(0x00ff00); // Bright green circle

        scene.addChild(bigCircle);

        // Add text that explains what should happen
        const warningText = new Text({
            text: 'IF YOU SEE THIS RED/GREEN,\nTHE FIX IS NOT WORKING!',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold',
                align: 'center',
                stroke: { color: 0x000000, width: 2 }
            }
        });

        warningText.x = 200;
        warningText.y = 100;
        warningText.anchor.set(0.5);
        scene.addChild(warningText);

        // Add more obvious visual elements
        for (let i = 0; i < 5; i++)
        {
            const rect = new Graphics()
                .roundRect(50 + (i * 60), 200, 50, 50, 10)
                .fill(0xffff00); // Yellow rectangles

            scene.addChild(rect);
        }

        // Critical: Set the scene (which acts as stage) to invisible
        // With our fix, this should prevent ALL rendering of children
        scene.visible = false;
    },
};
