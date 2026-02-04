import { Container, Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should demonstrate normal stage visibility - visible stage should render content',
    create: async (scene: Container) =>
    {
        // Create an attractive gradient background
        const background = new Graphics()
            .rect(0, 0, 400, 300)
            .fill({
                color: 0x1a1a2e,
                alpha: 1,
            });

        scene.addChild(background);

        // Add gradient overlay for depth
        const gradientOverlay = new Graphics()
            .rect(0, 0, 400, 300)
            .fill({
                color: 0x16213e,
                alpha: 0.7,
            });

        scene.addChild(gradientOverlay);

        // Create a main container for organized layout
        const mainContainer = new Container();

        scene.addChild(mainContainer);

        // Title section with better typography
        const titleText = new Text({
            text: '✓ STAGE VISIBILITY TEST',
            style: {
                fontSize: 28,
                fill: 0x00ff88,
                fontWeight: 'bold',
                align: 'center',
                letterSpacing: 2,
            }
        });

        titleText.x = 200;
        titleText.y = 30;
        titleText.anchor.set(0.5);
        mainContainer.addChild(titleText);

        // Subtitle
        const subtitleText = new Text({
            text: 'All elements should be visible and rendering correctly',
            style: {
                fontSize: 14,
                fill: 0xcccccc,
                align: 'center',
                fontStyle: 'italic',
            }
        });

        subtitleText.x = 200;
        subtitleText.y = 65;
        subtitleText.anchor.set(0.5);
        mainContainer.addChild(subtitleText);

        // Create animated elements section
        const elementsContainer = new Container();

        elementsContainer.y = 90;
        mainContainer.addChild(elementsContainer);

        // Central decoration - a nice glowing circle
        const glowCircle = new Graphics()
            .circle(200, 80, 45)
            .fill(0x0ea5e9);

        elementsContainer.addChild(glowCircle);

        const innerCircle = new Graphics()
            .circle(200, 80, 30)
            .fill(0x38bdf8);

        elementsContainer.addChild(innerCircle);

        const coreCircle = new Graphics()
            .circle(200, 80, 15)
            .fill(0x87ceeb);

        elementsContainer.addChild(coreCircle);

        // Display status indicators with different visibility states
        const statusContainer = new Container();

        statusContainer.y = 180;
        elementsContainer.addChild(statusContainer);

        // Create visual representation of display status bits
        const statusItems = [
            { label: 'VISIBLE', color: 0x10b981, status: 'ON' },
            { label: 'RENDERABLE', color: 0xf59e0b, status: 'ON' },
            { label: 'NOT CULLED', color: 0x8b5cf6, status: 'ON' },
        ];

        for (let i = 0; i < statusItems.length; i++)
        {
            const item = statusItems[i];
            const x = 50 + (i * 100);

            // Status indicator background
            const statusBg = new Graphics()
                .roundRect(x - 40, 0, 80, 50, 8)
                .fill(0x1f2937)
                .stroke({ color: item.color, width: 2 });

            statusContainer.addChild(statusBg);

            // Status dot
            const statusDot = new Graphics()
                .circle(x, 15, 6)
                .fill(item.color);

            statusContainer.addChild(statusDot);

            // Status label
            const statusLabel = new Text({
                text: item.label,
                style: {
                    fontSize: 10,
                    fill: 0xffffff,
                    align: 'center',
                    fontWeight: 'bold'
                }
            });

            statusLabel.x = x;
            statusLabel.y = 28;
            statusLabel.anchor.set(0.5);
            statusContainer.addChild(statusLabel);

            // Status value
            const statusValue = new Text({
                text: item.status,
                style: {
                    fontSize: 8,
                    fill: item.color,
                    align: 'center',
                    fontWeight: 'bold'
                }
            });

            statusValue.x = x;
            statusValue.y = 40;
            statusValue.anchor.set(0.5);
            statusContainer.addChild(statusValue);
        }

        // Add some decorative elements at the bottom
        const decorativeContainer = new Container();

        decorativeContainer.y = 250;
        mainContainer.addChild(decorativeContainer);

        // Create a row of small decorative shapes
        const shapes = [
            { type: 'rect', color: 0xff6b6b },
            { type: 'circle', color: 0x4ecdc4 },
            { type: 'triangle', color: 0xffd93d },
            { type: 'diamond', color: 0x6bcf7f },
            { type: 'star', color: 0xff8fb1 },
        ];

        for (let i = 0; i < shapes.length; i++)
        {
            const shape = shapes[i];
            const x = 60 + (i * 70);
            let graphic: Graphics;

            switch (shape.type)
            {
                case 'circle':
                    graphic = new Graphics().circle(x, 15, 12).fill(shape.color);
                    break;
                case 'triangle':
                    graphic = new Graphics()
                        .moveTo(x, 3)
                        .lineTo(x - 10, 23)
                        .lineTo(x + 10, 23)
                        .closePath()
                        .fill(shape.color);
                    break;
                case 'diamond':
                    graphic = new Graphics()
                        .moveTo(x, 3)
                        .lineTo(x + 12, 15)
                        .lineTo(x, 27)
                        .lineTo(x - 12, 15)
                        .closePath()
                        .fill(shape.color);
                    break;
                case 'star':
                    graphic = new Graphics()
                        .star(x, 15, 5, 12, 6)
                        .fill(shape.color);
                    break;
                default:
                    graphic = new Graphics()
                        .roundRect(x - 10, 5, 20, 20, 4)
                        .fill(shape.color);
            }

            decorativeContainer.addChild(graphic);
        }

        // Final status message
        const finalStatus = new Text({
            text: 'Stage is VISIBLE • All render groups active • Display status = 0b111',
            style: {
                fontSize: 12,
                fill: 0x00ff88,
                align: 'center',
                fontWeight: '500',
            }
        });

        finalStatus.x = 200;
        finalStatus.y = 280;
        finalStatus.anchor.set(0.5);
        mainContainer.addChild(finalStatus);

        // Keep scene visible (this is the control/normal case)
        scene.visible = true;
    },
};
