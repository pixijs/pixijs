import { Container } from '../../../../src/scene/container/Container';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render renderGroups correctly',
    create: async (scene: Container) =>
    {
        const square = new Graphics()
            .rect(0, 0, 30, 30)
            .fill('red');

        const squareContainer = new Container();

        square.height = 128;

        const square2 = new Graphics()
            .rect(0, 0, 30, 30)
            .fill('blue');

        squareContainer.x = 30;
        square2.x = 30;
        square2.height = 128;
        scene.addChild(square);
        squareContainer.addChild(square2);
        scene.addChild(squareContainer);

        squareContainer.isRenderGroup = true;
        square.isRenderGroup = true;

        scene.x = 30;
    },
};
