import { Matrix } from '../../../maths/matrix/Matrix';
import { applyMatrix } from './applyMatrix';

import type { TilingSprite } from '../TilingSprite';

/**
 * @param tilingSprite
 * @param uvs
 * @internal
 */
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

    // Build the forward transform that maps the [0..1] sprite quad to texture-uv space,
    // then invert it. Matches the formula used in TilingSpriteShader so square and
    // non-square sprites render the same pattern orientation under tileRotation.
    const tileMatrix = tilingSprite._tileTransform.matrix;
    const textureMatrix = Matrix.shared;

    textureMatrix.set(
        (tileMatrix.a * width) / tilingSprite.width,
        (tileMatrix.b * width) / tilingSprite.height,
        (tileMatrix.c * height) / tilingSprite.width,
        (tileMatrix.d * height) / tilingSprite.height,
        tileMatrix.tx / tilingSprite.width,
        tileMatrix.ty / tilingSprite.height,
    );

    textureMatrix.invert();

    applyMatrix(uvs, 2, 0, textureMatrix);
}
