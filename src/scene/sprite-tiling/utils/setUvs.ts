import { Matrix } from '../../../maths/matrix/Matrix';
import { applyMatrix } from './applyMatrix';

import type { TilingSprite } from '../TilingSprite';

export function setUvs(tilingSprite: TilingSprite, uvs: Float32Array)
{
    const texture = tilingSprite.texture;

    const width = texture.frame.width;
    const height = texture.frame.height;

    let anchorX = 0;
    let anchorY = 0;

    if (tilingSprite.applyAnchorToTexture)
    {
        anchorX = tilingSprite.anchor.x;
        anchorY = tilingSprite.anchor.y;
    }

    uvs[0] = uvs[6] = -anchorX;
    uvs[2] = uvs[4] = 1 - anchorX;
    uvs[1] = uvs[3] = -anchorY;
    uvs[5] = uvs[7] = 1 - anchorY;

    const textureMatrix = Matrix.shared;

    textureMatrix.copyFrom(tilingSprite._tileTransform.matrix);

    textureMatrix.tx /= tilingSprite.width;
    textureMatrix.ty /= tilingSprite.height;

    textureMatrix.invert();

    textureMatrix.scale(tilingSprite.width / width, tilingSprite.height / height);

    applyMatrix(uvs, 2, 0, textureMatrix);
}
