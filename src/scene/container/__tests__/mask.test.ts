import '~/rendering/init';
import { Graphics } from '../../graphics/shared/Graphics';
import { Container } from '../Container';

describe('Mask Tests', () =>
{
    it('should correctly set a mask to null and back', async () =>
    {
        const container = new Container({
            label: 'container',
        });

        const mask = new Graphics({
            label: 'mask',
        })
            .rect(0, 0, 100, 100)
            .fill('red');

        expect(() =>
        {
            container.mask = mask;
            container.mask = null;
            container.mask = mask;
        }).not.toThrow();
    });

    it('should clear the mask when setMask is given a null mask', () =>
    {
        const container = new Container();
        const mask = new Graphics().rect(0, 0, 100, 100).fill('red');

        container.setMask({ mask });
        expect(container.mask).toBe(mask);

        container.setMask({ mask: null });
        expect(container.mask).toBeUndefined();
    });

    it('should keep the mask when setMask is given options without one', () =>
    {
        const container = new Container();
        const mask = new Graphics().rect(0, 0, 100, 100).fill('red');

        container.setMask({ mask });
        container.setMask({ inverse: true });

        expect(container.mask).toBe(mask);
    });
});

