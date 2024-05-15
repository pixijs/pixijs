import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';

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
});

