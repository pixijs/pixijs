import { BackgroundSystem } from '../../src/rendering/renderers/shared/background/BackgroundSystem';
import '../../src/rendering/init';
import '../../src/scene/graphics/init';

import type { BackgroundSystemOptions } from '../../src/rendering/renderers/shared/background/BackgroundSystem';

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

    it('should use transparent alpha if no background set with options', async () =>
    {
        const backgroundSystem = new BackgroundSystem();

        backgroundSystem.init({} as BackgroundSystemOptions);

        expect(backgroundSystem.alpha).toEqual(0);
    });

    it('should use non-transparent alpha if background set with options', async () =>
    {
        const backgroundSystem = new BackgroundSystem();

        backgroundSystem.init({ backgroundColor: 'red' } as BackgroundSystemOptions);

        expect(backgroundSystem.alpha).toEqual(1);
    });

    it('should use non-transparent alpha if background set after options', async () =>
    {
        const backgroundSystem = new BackgroundSystem();

        backgroundSystem.init({} as BackgroundSystemOptions);

        expect(backgroundSystem.alpha).toEqual(0);

        backgroundSystem.color = 'red';

        expect(backgroundSystem.alpha).toEqual(1);
    });
});
