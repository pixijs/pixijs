import { Graphics } from '../../graphics/shared/Graphics';
import { Container } from '../Container';
import { ScissorMask, StencilMask } from '~/rendering';

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

    it('should use ScissorMask for a simple rectangular Graphics mask', () =>
    {
        const container = new Container();

        const mask = new Graphics()
            .rect(0, 0, 100, 100)
            .fill('red');

        container.mask = mask;

        expect(container._maskEffect).toBeInstanceOf(ScissorMask);
    });

    it('should use StencilMask for a non-rectangular Graphics mask', () =>
    {
        const container = new Container();

        const mask = new Graphics()
            .circle(50, 50, 50)
            .fill('red');

        container.mask = mask;

        expect(container._maskEffect).toBeInstanceOf(StencilMask);
    });
});

