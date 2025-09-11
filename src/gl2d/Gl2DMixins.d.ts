import { type SerializeBitmapTextMixin } from './serialize/nodes/serializeBitmapText';
import { type SerializeContainerMixin } from './serialize/nodes/serializeContainer';
import { type SerializeNineSliceSpriteMixin } from './serialize/nodes/serializeNineSliceSprite';
import { type SerializeSpriteMixin } from './serialize/nodes/serializeSprite';
import { type SerializeTextMixin } from './serialize/nodes/serializeText';
import { type SerializeTilingSpriteMixin } from './serialize/nodes/serializeTilingSprite';
import { type SerializeFillGradientMixin } from './serialize/resources/serializeFillGradient';
import { type SerializeFillPatternMixin } from './serialize/resources/serializeFillPattern';
import { type SerializeImageSourceMixin } from './serialize/resources/serializeImageSource';
import { type SerializeTextStyleMixin } from './serialize/resources/serializeTextStyle';
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
        interface NineSliceSprite extends SerializeNineSliceSpriteMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface TilingSprite extends SerializeTilingSpriteMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Text extends SerializeTextMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface BitmapText extends SerializeBitmapTextMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Texture extends SerializeTextureMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface TextureSource extends SerializeTextureSourceMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ImageSource extends SerializeImageSourceMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface VideoSource extends SerializeVideoSourceMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface TextStyle extends SerializeTextStyleMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface FillGradient extends SerializeFillGradientMixin { }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface FillPattern extends SerializeFillPatternMixin { }
    }
}

export {};
