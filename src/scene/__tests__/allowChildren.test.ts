import { Container } from '../container/Container';
import { Graphics } from '../graphics/shared/Graphics';
import { Mesh } from '../mesh/shared/Mesh';
import { MeshGeometry } from '../mesh/shared/MeshGeometry';
import { Sprite } from '../sprite/Sprite';
import { NineSliceSprite } from '../sprite-nine-slice/NineSliceSprite';
import { TilingSprite } from '../sprite-tiling/TilingSprite';
import { Text } from '../text/Text';
import { getTexture } from '@test-utils';

describe('allowChildren', () =>
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
