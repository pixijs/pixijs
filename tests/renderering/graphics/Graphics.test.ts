import { Graphics } from '../../../src/rendering/graphics/shared/Graphics';

describe('Graphics', () =>
{
    it('should not throw when destroyed', () =>
    {
        const sprite = new Graphics();

        expect(() => sprite.destroy()).not.toThrow();
    });

    it('should not throw when destroying it context', () =>
    {
        const sprite = new Graphics();

        expect(() => sprite.destroy(true)).not.toThrow();
    });
});
