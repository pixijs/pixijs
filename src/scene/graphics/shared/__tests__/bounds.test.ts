import { GraphicsContext } from '~/scene';

describe('Graphics context bounds calculation', (): void =>
{
    it('should recalculate bounds on content change, even if gpuContext was not updated yet', (): void =>
    {
        const gc = new GraphicsContext();

        gc.clear();

        const emptyBounds = gc.bounds.clone();

        gc.rect(0, 0, 10, 10);
        gc.fill();

        const rectBounds = gc.bounds.clone();

        expect(emptyBounds).not.toEqual(rectBounds);
    });
});
