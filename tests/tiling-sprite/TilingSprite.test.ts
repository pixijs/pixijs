import { TilingSprite } from '../../src/tiling-sprite/TilingSprite';

describe('TilingSprite', () =>
{
    it('should not throw when destroyed', () =>
    {
        const sprite = new TilingSprite();

        expect(() => sprite.destroy()).not.toThrow();
    });
});
