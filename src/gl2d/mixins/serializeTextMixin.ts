import { serializeText } from '../serializers/nodes/serializeText';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { Text } from '../../scene/text/Text';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeTextMixin: Partial<Text> = {
    toGl2d(this: Text, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeText(this, ctx);
    },
} as Partial<Text>;
