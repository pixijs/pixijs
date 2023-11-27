import { Container } from '../../../../src/scene/container/Container';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { GraphicsContext } from '../../../../src/scene/graphics/shared/GraphicsContext';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should tint layers correctly',
    create: async (scene: Container) =>
    {
        // layer green container..
        const squareContext = new GraphicsContext()
            .rect(0, 0, 20, 20)
            .fill('white');

        const greenContainer = new Container({
            layer: false,
        });

        greenContainer.addChild(new Graphics(squareContext));

        greenContainer.tint = 'green';

        // non layer red container.
        const redContainer = new Container({
            layer: true,
        });

        scene.addChild(greenContainer);

        redContainer.addChild(new Graphics(squareContext));
        redContainer.x = 30;
        redContainer.tint = 'red';

        scene.addChild(redContainer);

        const nestedLayer = new Container({
            layer: true,
        });

        const whiteContainer = new Container({
            layer: true,
        });

        whiteContainer.addChild(new Graphics(squareContext));

        const blueContainer = new Container({
            layer: false,
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
