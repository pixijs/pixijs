import { BackgroundSystem } from '../BackgroundSystem';

describe('BackgroundSystem', () =>
{
    it('should set alpha correctly from backgroundAlpha', async () =>
    {
        const backgroundSystem = new BackgroundSystem();

        backgroundSystem.init({
            backgroundColor: 'red',
            backgroundAlpha: 0.5,
            clearBeforeRender: true
        });

        expect(backgroundSystem.alpha).toEqual(0.5);
        expect(backgroundSystem.colorRgba).toEqual([1, 0, 0, 0.5]);

        backgroundSystem.alpha = 1;

        expect(backgroundSystem.alpha).toEqual(1);
        expect(backgroundSystem.colorRgba).toEqual([1, 0, 0, 1]);
    });
});
