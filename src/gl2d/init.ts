import { extensions } from '../extensions/Extensions';
import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Container } from '../scene/container/Container';
import { Sprite } from '../scene/sprite/Sprite';
import { Spritesheet } from '../spritesheet/Spritesheet';
import { serializeContainerMixin } from './mixins/serializeContainerMixin';
import { serializeSpriteMixin } from './mixins/serializeSpriteMixin';
import { serializeSpritesheetMixin } from './mixins/serializeSpritesheetMixin';
import { serializeTextureMixin } from './mixins/serializeTextureMixin';
import { serializeTextureSourceMixin } from './mixins/serializeTextureSourceMixin';

export * from './index';

extensions.mixin(Container, serializeContainerMixin);
extensions.mixin(Sprite, serializeSpriteMixin);
extensions.mixin(Texture, serializeTextureMixin);
extensions.mixin(TextureSource, serializeTextureSourceMixin);
extensions.mixin(Spritesheet, serializeSpritesheetMixin);
