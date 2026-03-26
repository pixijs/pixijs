import { serializeSprite } from '../serializers/serializeSprite';

import type { Sprite } from '../../scene/sprite/Sprite';
import type { Gl2dRef } from '../Gl2dSchema';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeSpriteMixin: Partial<Sprite> = {
    toGl2d(this: Sprite, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeSprite(this, ctx);
    },
} as Partial<Sprite>;
