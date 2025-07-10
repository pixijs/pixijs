/* eslint-disable @typescript-eslint/no-empty-object-type */
import { type CollectRenderablesMixin } from './container/container-mixins/collectRenderablesMixin';
import { type GetFastGlobalBoundsMixin } from './container/container-mixins/getFastGlobalBoundsMixin';

import type { ContainerChild } from './container/Container';
import type { CacheAsTextureMixin, CacheAsTextureMixinConstructor } from './container/container-mixins/cacheAsTextureMixin';
import type { ChildrenHelperMixin } from './container/container-mixins/childrenHelperMixin';
import type { EffectsMixin, EffectsMixinConstructor } from './container/container-mixins/effectsMixin';
import type { FindMixin, FindMixinConstructor } from './container/container-mixins/findMixin';
import type { GetGlobalMixin } from './container/container-mixins/getGlobalMixin';
import type { MeasureMixin, MeasureMixinConstructor } from './container/container-mixins/measureMixin';
import type { OnRenderMixin, OnRenderMixinConstructor } from './container/container-mixins/onRenderMixin';
import type { SortMixin, SortMixinConstructor } from './container/container-mixins/sortMixin';
import type { ToLocalGlobalMixin } from './container/container-mixins/toLocalGlobalMixin';

declare global
{
    namespace PixiMixins
    {

        interface Container<C extends ContainerChild = ContainerChild>
            extends ChildrenHelperMixin<C>,
            ToLocalGlobalMixin,
            OnRenderMixin,
            MeasureMixin,
            EffectsMixin,
            FindMixin,
            SortMixin,
            GetGlobalMixin,
            CollectRenderablesMixin,
            GetFastGlobalBoundsMixin,
            CacheAsTextureMixin {}

        interface ContainerOptions
            extends OnRenderMixinConstructor,
            MeasureMixinConstructor,
            EffectsMixinConstructor,
            FindMixinConstructor,
            SortMixinConstructor,
            CacheAsTextureMixinConstructor {}

        interface ViewContainer {}
        interface ViewContainerOptions {}

        interface Graphics {}
        interface GraphicsOptions {}

        interface Mesh {}
        interface MeshOptions {}

        interface ParticleContainer {}
        interface ParticleContainerOptions {}

        interface Sprite {}
        interface SpriteOptions {}

        interface AnimatedSprite {}
        interface AnimatedSpriteOptions {}

        interface NineSliceSprite {}
        interface NineSliceSpriteOptions {}

        interface TilingSprite {}
        interface TilingSpriteOptions {}

        interface Text {}
        interface BitmapText {}
        interface TextOptions {}

        interface HTMLText {}
        interface HTMLTextOptions {}

        interface SplitText {}
        interface SplitTextOptions {}
        interface SplitBitmapText {}
        interface SplitBitmapTextOptions {}

    }
}

export { };

