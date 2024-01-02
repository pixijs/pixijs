import type { TilingSprite } from '../TilingSprite';

export function setPositions(tilingSprite: TilingSprite, positions: Float32Array)
{
    const anchorX = tilingSprite.anchor.x;
    const anchorY = tilingSprite.anchor.y;

    positions[0] = -anchorX * tilingSprite.width;
    positions[1] = -anchorY * tilingSprite.height;
    positions[2] = (1 - anchorX) * tilingSprite.width;
    positions[3] = -anchorY * tilingSprite.height;
    positions[4] = (1 - anchorX) * tilingSprite.width;
    positions[5] = (1 - anchorY) * tilingSprite.height;
    positions[6] = -anchorX * tilingSprite.width;
    positions[7] = (1 - anchorY) * tilingSprite.height;
}
