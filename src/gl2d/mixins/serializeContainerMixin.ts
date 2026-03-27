import { serializeContainer } from '../serializers/serializeContainer';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { Container } from '../../scene/container/Container';
import type { Gl2dSerializeContext } from '../serializeContext';

export type { Gl2dSerializeMixin } from './Gl2dSerializeMixin';

/** @internal */
export const serializeContainerMixin: Partial<Container> = {
    toGl2d(this: Container, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeContainer(this, ctx);
    },
} as Partial<Container>;
