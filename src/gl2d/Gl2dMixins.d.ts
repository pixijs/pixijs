import type { Gl2dSerializeMixin } from './mixins/Gl2dSerializeMixin';

declare module '../rendering/renderers/shared/texture/Texture'
{
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Texture extends Gl2dSerializeMixin {}
}

declare module '../rendering/renderers/shared/texture/sources/TextureSource'
{
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface TextureSource extends Gl2dSerializeMixin {}
}

declare module '../spritesheet/Spritesheet'
{
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Spritesheet extends Gl2dSerializeMixin {}
}

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends Gl2dSerializeMixin {}
    }
}

export {};
