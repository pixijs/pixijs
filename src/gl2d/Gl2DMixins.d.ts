import { type SerializeContainerMixin } from './serialize/nodes/serializeContainer';
import { type SerializeSpriteMixin } from './serialize/nodes/serializeSprite';
import { type SerializeImageSourceMixin } from './serialize/resources/serializeImageSource';
import { type SerializeTextureMixin } from './serialize/resources/serializeTexture';
import { type SerializeTextureSourceMixin } from './serialize/resources/serializeTextureSource';
import { type SerializeVideoSourceMixin } from './serialize/resources/serializeVideoSource';

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends SerializeContainerMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Sprite extends SerializeSpriteMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Texture extends SerializeTextureMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface TextureSource extends SerializeTextureSourceMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ImageSource extends SerializeImageSourceMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface VideoSource extends SerializeVideoSourceMixin { }
    }
}

export {};
