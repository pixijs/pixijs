import { Container, Graphics, GraphicsContext } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should tint render groups correctly',
    create: async (scene: Container) =>
    {
        // layer green container..
        const squareContext = new GraphicsContext()
            .rect(0, 0, 20, 20)
            .fill('white');

        const greenContainer = new Container({
            isRenderGroup: false,
        });

        greenContainer.addChild(new Graphics(squareContext));

        greenContainer.tint = 'green';

        // non layer red container.
        const redContainer = new Container({
            isRenderGroup: true,
        });

        scene.addChild(greenContainer);

        redContainer.addChild(new Graphics(squareContext));
        redContainer.x = 30;
        redContainer.tint = 'red';

        scene.addChild(redContainer);

        const nestedLayer = new Container({
            isRenderGroup: true,
        });

        const whiteContainer = new Container({
            isRenderGroup: true,
        });

        whiteContainer.addChild(new Graphics(squareContext));

        const blueContainer = new Container({
            isRenderGroup: false,
        });

        blueContainer.addChild(new Graphics(squareContext));
        blueContainer.x = 30;

        nestedLayer.addChild(whiteContainer, blueContainer);

        nestedLayer.y = 30;

        nestedLayer.tint = 0x0000FF;

        scene.addChild(nestedLayer);

        scene.scale.set(128 / 50);
    },
};
