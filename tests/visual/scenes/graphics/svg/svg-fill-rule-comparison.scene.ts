import { Assets } from '~/assets';
import { type Container, Graphics, type GraphicsContext } from '~/scene';

import type { TestScene } from '../../../types';

export const scene: TestScene = {
    it: 'should render SVG fill-rule comparison showing evenodd vs nonzero behaviors',
    create: async (scene: Container) =>
    {
        // Load all the SVG test assets
        const [
            evenoddBasic,
            nonzeroBasic,
            multipleHoles,
            nestedHoles,
            starEvenodd,
            starNonzero
        ] = await Promise.all([
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-evenodd-basic.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-nonzero-basic.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-multiple-holes.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-nested-holes.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-star-evenodd.svg',
                data: { parseAsGraphicsContext: true }
            }),
            Assets.load<GraphicsContext>({
                src: 'svg-fill-rule-star-nonzero.svg',
                data: { parseAsGraphicsContext: true }
            }),
        ]);

        // Create a grid layout for comparison
        const createGraphic = (context: GraphicsContext, x: number, y: number, scale = 0.4) =>
        {
            const graphics = new Graphics(context);

            graphics.scale.set(scale);
            graphics.position.set(x, y);

            return graphics;
        };

        // Row 1: Basic tests (evenodd vs nonzero)
        scene.addChild(createGraphic(evenoddBasic, 10, 10));
        scene.addChild(createGraphic(nonzeroBasic, 90, 10));

        // Row 2: Multiple and nested holes
        scene.addChild(createGraphic(multipleHoles, 10, 90));
        scene.addChild(createGraphic(nestedHoles, 90, 90));

        // Row 3: Star comparison (evenodd vs nonzero)
        scene.addChild(createGraphic(starEvenodd, 10, 170));
        scene.addChild(createGraphic(starNonzero, 90, 170));
    },
};
