import { DisplacementFilter } from '../../src/filters/defaults/displacement/DisplacementFilter';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../src/scene/sprite/Sprite';

describe('BlurFilter', () =>
{
    it('should construct filter', () =>
    {
        const sprite = new Sprite(Texture.WHITE);
        const filter = new DisplacementFilter({
            sprite,
            scale: { x: 8, y: 10 },
        });

        expect(filter).toBeInstanceOf(DisplacementFilter);
        expect(filter.scale.x).toEqual(8);
        expect(filter.scale.y).toEqual(10);
        filter.destroy();
    });
});
