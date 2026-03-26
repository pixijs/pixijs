import { type Spritesheet } from '../../spritesheet/Spritesheet';
import { serializeSpritesheet } from '../serializers/resources/serializeSpritesheet';

import type { Gl2dRef } from '../Gl2dSchema';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeSpritesheetMixin: Partial<Spritesheet> = {
    toGl2d(this: Spritesheet, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeSpritesheet(this, ctx);
    },
} as Partial<Spritesheet>;
