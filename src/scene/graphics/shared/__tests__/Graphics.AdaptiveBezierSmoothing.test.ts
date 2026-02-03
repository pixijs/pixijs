import '~/environment-browser/browserAll';
import { Graphics } from '../Graphics';
import { GraphicsContextSystem } from '../GraphicsContextSystem';
import { Application } from '~/app';

import type { Polygon } from '~/maths';

describe('Graphics Adaptive Bezier Smoothing', () =>
{
    it('should update default value from app options', async () =>
    {
        const app = new Application();

        await app.init({
            bezierSmoothness: 0.75,
        });

        expect(GraphicsContextSystem.defaultOptions.bezierSmoothness).toBe(0.75);
    });

    it('should use increase bezier segments when smoothing value used', () =>
    {
        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        // use defaults
        graphics1.bezierCurveTo(1, 2, 3, 4, 5, 6);

        // use smoothness value
        graphics2.bezierCurveTo(1, 2, 3, 4, 5, 6, 1 /* full smoothness */);

        const shape1 = graphics1.context['_activePath'].shapePath.shapePrimitives[0].shape as Polygon;
        const shape2 = graphics2.context['_activePath'].shapePath.shapePrimitives[0].shape as Polygon;

        expect(shape2.points.length).toBeGreaterThan(shape1.points.length);
    });

    it('should use increase quadratic segments when smoothing value used', () =>
    {
        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        // use defaults
        graphics1.roundShape([
            { x: 0, y: 0, radius: 10 },
            { x: 10, y: 0, radius: 10 },
            { x: 10, y: 10, radius: 10 },
            { x: 0, y: 10, radius: 10 },
        ], 10, true);

        // use smoothness value
        graphics2.roundShape([
            { x: 0, y: 0, radius: 10 },
            { x: 10, y: 0, radius: 10 },
            { x: 10, y: 10, radius: 10 },
            { x: 0, y: 10, radius: 10 },
        ], 10, true, 1 /* full smoothness */);

        const shape1 = graphics1.context['_activePath'].shapePath.shapePrimitives[0].shape as Polygon;
        const shape2 = graphics2.context['_activePath'].shapePath.shapePrimitives[0].shape as Polygon;

        expect(shape2.points.length).toBeGreaterThan(shape1.points.length);
    });
});
