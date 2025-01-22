import { FillGradient, type FillGradientOptions } from '../FillGradient';

describe('FillGradient', () =>
{
    const createLinearGradient = (options?: Partial<FillGradientOptions>) => new FillGradient({
        type: 'linear',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        stops: [
            { offset: 0, color: 'white' },
            { offset: 1, color: 'black' },
        ],
        ...options,
    });

    describe('constructor', () =>
    {
        it('should create a gradient with options', () =>
        {
            const gradient = new FillGradient({
                type: 'linear',
                start: { x: 0, y: 10 },
                end: { x: 200, y: 100 },
            });

            expect(gradient.shape).toEqual({
                type: 'linear',
                start: { x: 0, y: 10 },
                end: { x: 200, y: 100 },
            });
            expect(gradient.gradientStops.length).toBe(0);

            gradient.destroy();
        });

        it('should create a gradient with args, backward compatibility', () =>
        {
            const gradient = new FillGradient(0, 10, 200, 100);

            expect(gradient.x0).toBe(0);
            expect(gradient.y0).toBe(10);
            expect(gradient.x1).toBe(200);
            expect(gradient.y1).toBe(100);
            expect(gradient.type).toBe('linear');

            gradient.destroy();
        });

        it('should create a gradient with stop property', () =>
        {
            const gradient = new FillGradient({
                type: 'linear',
                start: { x: 0, y: 10 },
                end: { x: 200, y: 100 },
                stops: [
                    { offset: 0, color: '#ff0000' },
                    { offset: 1, color: '#00ff00' },
                ]
            });

            expect(gradient.shape).toEqual({
                type: 'linear',
                start: { x: 0, y: 10 },
                end: { x: 200, y: 100 },
            });

            expect(gradient.gradientStops).toEqual([
                { offset: 0, color: '#ff0000ff' },
                { offset: 1, color: '#00ff00ff' },
            ]);

            gradient.destroy();
        });
    });

    describe('addColorStop', () =>
    {
        it('should add a color stop', () =>
        {
            const gradient = new FillGradient(0, 10, 200, 100);

            gradient.addColorStop(0, 0xff0000);

            expect(gradient.gradientStops).toEqual([
                { offset: 0, color: '#ff0000ff' },
            ]);

            gradient.destroy();
        });
    });

    describe('build', () =>
    {
        it('should build with default textureSize', () =>
        {
            const gradient = createLinearGradient();

            gradient.build();

            expect(gradient.texture.width).toEqual(FillGradient.defaultTextureSize);
            expect(gradient.texture.height).toEqual(1);

            gradient.destroy();
        });

        it('should build with redefined defaultTextureSize', () =>
        {
            const oldDefault = FillGradient.defaultTextureSize;

            FillGradient.defaultTextureSize = 128;

            const gradient = createLinearGradient();

            gradient.build();

            expect(gradient.texture.width).toEqual(FillGradient.defaultTextureSize);
            expect(gradient.texture.height).toEqual(1);

            FillGradient.defaultTextureSize = oldDefault;

            gradient.destroy();
        });

        it('should build with custom textureSize', () =>
        {
            const gradient = createLinearGradient({ textureSize: 128 });

            gradient.build();

            expect(gradient.texture.width).toEqual(128);
            expect(gradient.texture.height).toEqual(1);

            gradient.destroy();
        });
    });

    describe('dispose', () =>
    {
        it('should dispose of the texture', () =>
        {
            const gradient = createLinearGradient();

            gradient.build();
            gradient.dispose();

            expect(gradient.texture).toBeNull();

            gradient.destroy();
        });
    });
});
