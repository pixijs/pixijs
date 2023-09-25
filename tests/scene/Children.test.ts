import { NineSliceSprite } from '../../src/mesh-extras/NineSlicePlane';
import { Graphics } from '../../src/rendering/graphics/shared/Graphics';
import { Mesh } from '../../src/rendering/mesh/shared/Mesh';
import { MeshGeometry } from '../../src/rendering/mesh/shared/MeshGeometry';
import { Container } from '../../src/rendering/scene/Container';
import { Sprite } from '../../src/rendering/sprite/shared/Sprite';
import { Text } from '../../src/rendering/text/Text';
import { TilingSprite } from '../../src/tiling-sprite/TilingSprite';
import { getTexture } from '../utils/getTexture';

describe('Add Children', () =>
{
    it('should accept children', () =>
    {
        const container = new Container();
        const sprite = new Sprite();
        const text = new Text('Hello, world!');
        const quadGeometry = new MeshGeometry({
            positions: new Float32Array([-10, -10, 10, -10, 10, 10, -10, 10]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3]), // triangle 1);
        });

        const mesh = new Mesh({
            texture: getTexture(),
            geometry: quadGeometry
        });
        const tilingSprite = new TilingSprite();
        const nineSlice = new NineSliceSprite(getTexture());
        const graphics = new Graphics();

        expect(container.allowChildren).toBe(true);
        expect(sprite.allowChildren).toBe(false);
        expect(text.allowChildren).toBe(false);
        expect(mesh.allowChildren).toBe(false);
        expect(tilingSprite.allowChildren).toBe(false);
        expect(nineSlice.allowChildren).toBe(false);
        expect(graphics.allowChildren).toBe(false);
    });
});
