import { Container, Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should demonstrate display status behavior visually',
    create: async (scene: Container) =>
    {
        // Create a 2x2 grid to show different visibility scenarios
        const gridWidth = 150;
        const gridHeight = 120;
        const padding = 10;

        // Scenario 1: Normal visible stage with visible content
        const scenario1 = new Container();

        scenario1.x = padding;
        scenario1.y = padding;

        const bg1 = new Graphics()
            .roundRect(0, 0, gridWidth, gridHeight, 10)
            .fill(0x2c3e50);

        scenario1.addChild(bg1);

        const rect1 = new Graphics()
            .roundRect(20, 30, 60, 40, 5)
            .fill(0xe74c3c);

        scenario1.addChild(rect1);

        const label1 = new Text({
            text: 'Visible Stage\nVisible Content',
            style: { fontSize: 12, fill: 0xffffff, align: 'center' }
        });

        label1.x = gridWidth / 2;
        label1.y = gridHeight - 25;
        label1.anchor.set(0.5);
        scenario1.addChild(label1);

        scene.addChild(scenario1);

        // Scenario 2: Visible stage with invisible content (child invisible)
        const scenario2 = new Container();

        scenario2.x = gridWidth + (padding * 2);
        scenario2.y = padding;

        const bg2 = new Graphics()
            .roundRect(0, 0, gridWidth, gridHeight, 10)
            .fill(0x34495e);

        scenario2.addChild(bg2);

        const rect2 = new Graphics()
            .roundRect(20, 30, 60, 40, 5)
            .fill(0xf39c12);

        rect2.visible = false; // Child invisible
        scenario2.addChild(rect2);

        const label2 = new Text({
            text: 'Visible Stage\nInvisible Child',
            style: { fontSize: 12, fill: 0xffffff, align: 'center' }
        });

        label2.x = gridWidth / 2;
        label2.y = gridHeight - 25;
        label2.anchor.set(0.5);
        scenario2.addChild(label2);

        scene.addChild(scenario2);

        // Scenario 3: Alpha = 0 with visible stage (should still render background)
        const scenario3 = new Container();

        scenario3.x = padding;
        scenario3.y = gridHeight + (padding * 2);

        const bg3 = new Graphics()
            .roundRect(0, 0, gridWidth, gridHeight, 10)
            .fill(0x8e44ad);

        scenario3.addChild(bg3);

        const rect3 = new Graphics()
            .roundRect(20, 30, 60, 40, 5)
            .fill(0x27ae60);

        rect3.alpha = 0; // Alpha 0 but visible = true
        scenario3.addChild(rect3);

        const label3 = new Text({
            text: 'Visible Stage\nAlpha = 0',
            style: { fontSize: 12, fill: 0xffffff, align: 'center' }
        });

        label3.x = gridWidth / 2;
        label3.y = gridHeight - 25;
        label3.anchor.set(0.5);
        scenario3.addChild(label3);

        scene.addChild(scenario3);

        // Scenario 4: Mixed visibility in render groups
        const scenario4 = new Container({ isRenderGroup: true });

        scenario4.x = gridWidth + (padding * 2);
        scenario4.y = gridHeight + (padding * 2);

        const bg4 = new Graphics()
            .roundRect(0, 0, gridWidth, gridHeight, 10)
            .fill(0x16a085);

        scenario4.addChild(bg4);

        // Two children: one visible, one invisible
        const rect4a = new Graphics()
            .roundRect(20, 30, 25, 20, 3)
            .fill(0xf1c40f);

        rect4a.visible = true;
        scenario4.addChild(rect4a);

        const rect4b = new Graphics()
            .roundRect(55, 30, 25, 20, 3)
            .fill(0xe67e22);

        rect4b.visible = false; // This one invisible
        scenario4.addChild(rect4b);

        const rect4c = new Graphics()
            .roundRect(90, 30, 25, 20, 3)
            .fill(0x9b59b6);

        rect4c.alpha = 0.5; // Semi-transparent
        scenario4.addChild(rect4c);

        const label4 = new Text({
            text: 'Render Group\nMixed Visibility',
            style: { fontSize: 12, fill: 0xffffff, align: 'center' }
        });

        label4.x = gridWidth / 2;
        label4.y = gridHeight - 25;
        label4.anchor.set(0.5);
        scenario4.addChild(label4);

        scene.addChild(scenario4);

        // Add title for the entire test
        const title = new Text({
            text: 'Display Status Visual Test',
            style: {
                fontSize: 16,
                fill: 0xffffff,
                fontWeight: 'bold',
                align: 'center'
            }
        });

        title.x = ((gridWidth * 2) + (padding * 3)) / 2;
        title.y = (gridHeight * 2) + (padding * 4);
        title.anchor.set(0.5, 0);
        scene.addChild(title);

        // Add explanation
        const explanation = new Text({
            text: `Top-left: Normal visible\nTop-right:
            Child invisible\nBottom-left: Alpha=0\nBottom-right:
            Mixed visibility`,
            style: {
                fontSize: 11,
                fill: 0xcccccc,
                align: 'center'
            }
        });

        explanation.x = ((gridWidth * 2) + (padding * 3)) / 2;
        explanation.y = (gridHeight * 2) + (padding * 4) + 25;
        explanation.anchor.set(0.5, 0);
        scene.addChild(explanation);
    },
};
