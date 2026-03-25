import type { Gl2dSerializeMixin } from './mixins/serializeContainerMixin';

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends Gl2dSerializeMixin {}
    }
}

export {};
