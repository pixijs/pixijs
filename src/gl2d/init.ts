import { extensions } from '../extensions/Extensions';
import { ImageSource } from '../rendering/renderers/shared/texture/sources/ImageSource';
import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { VideoSource } from '../rendering/renderers/shared/texture/sources/VideoSource';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Container } from '../scene/container/Container';
import { Sprite } from '../scene/sprite/Sprite';
import { Spritesheet } from '../spritesheet/Spritesheet';
import { serializeContainerMixin } from './mixins/serializeContainerMixin';
import { serializeImageSourceMixin } from './mixins/serializeImageSourceMixin';
import { serializeSpriteMixin } from './mixins/serializeSpriteMixin';
import { serializeSpritesheetMixin } from './mixins/serializeSpritesheetMixin';
import { serializeTextureMixin } from './mixins/serializeTextureMixin';
import { serializeTextureSourceMixin } from './mixins/serializeTextureSourceMixin';
import { serializeVideoSourceMixin } from './mixins/serializeVideoSourceMixin';

export * from './index';

extensions.mixin(Container, serializeContainerMixin);
extensions.mixin(Sprite, serializeSpriteMixin);
extensions.mixin(Texture, serializeTextureMixin);
extensions.mixin(TextureSource, serializeTextureSourceMixin);
extensions.mixin(ImageSource, serializeImageSourceMixin);
extensions.mixin(VideoSource, serializeVideoSourceMixin);
extensions.mixin(Spritesheet, serializeSpritesheetMixin);
