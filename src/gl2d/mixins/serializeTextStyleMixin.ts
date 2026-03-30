import { serializeTextStyle } from '../serializers/resources/text/serializeTextStyle';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { TextStyle } from '../../scene/text/TextStyle';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeTextStyleMixin: Partial<TextStyle> = {
    toGl2d(this: TextStyle, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeTextStyle(this, ctx);
    },
} as Partial<TextStyle>;
