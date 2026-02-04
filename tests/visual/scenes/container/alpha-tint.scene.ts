import { Container, Graphics, GraphicsContext } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should alpha tint scenes correctly',
    create: async (scene: Container) =>
    {
        // layer green container..
        const squareContext = new GraphicsContext()
            .rect(0, 0, 20, 20)
            .fill('black');

        squareContext.batchMode = 'no-batch';

        const alphaSquare = new Graphics(squareContext);

        alphaSquare.alpha = 0.25;

        scene.addChild(alphaSquare);
        const renderGroup = new Container({
            isRenderGroup: true,
            x: 30,
            alpha: 0.25
        });

        renderGroup.addChild(new Graphics(squareContext));

        scene.addChild(renderGroup);

        // nested render in group
        const nestedRenderGroup = new Container({
            isRenderGroup: true,
            y: 30,
            alpha: 0.5
        });

        nestedRenderGroup.addChild(new Graphics({
            context: squareContext,
            alpha: 0.5
        }));

        scene.addChild(nestedRenderGroup);

        // nested nested render group

        // nested render in group
        const topNestedRenderGroup = new Container({
            isRenderGroup: true,
            x: 30,
            y: 30,
            alpha: 0.5
        });

        const innerNestedRenderGroup = new Container({
            isRenderGroup: true,
            alpha: 0.5
        });

        topNestedRenderGroup.addChild(innerNestedRenderGroup);

        innerNestedRenderGroup.addChild(new Graphics({
            context: squareContext,
        }));

        scene.addChild(topNestedRenderGroup);

        scene.scale.set(128 / 50);
    },
};
