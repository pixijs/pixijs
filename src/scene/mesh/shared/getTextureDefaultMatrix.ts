import type { Matrix } from '../../../maths/matrix/Matrix';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';

export function getTextureDefaultMatrix(texture: Texture, out: Matrix): Matrix
{
    const { width, height } = texture.frame;

    out.scale(1 / width, 1 / height);

    return out;
}
