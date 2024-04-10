import type { ContainerChild } from './container/Container';
import type { ChildrenHelperMixin } from './container/container-mixins/childrenHelperMixin';
import type { EffectsMixin, EffectsMixinConstructor } from './container/container-mixins/effectsMixin';
import type { FindMixin, FindMixinConstructor } from './container/container-mixins/findMixin';
import type { MeasureMixin, MeasureMixinConstructor } from './container/container-mixins/measureMixin';
import type { OnRenderMixin, OnRenderMixinConstructor } from './container/container-mixins/onRenderMixin';
import type { SortMixin, SortMixinConstructor } from './container/container-mixins/sortMixin';
import type { ToLocalGlobalMixin } from './container/container-mixins/toLocalGlobalMixin';

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Container<C extends ContainerChild = ContainerChild>
            extends ChildrenHelperMixin<C>,
            ToLocalGlobalMixin,
            OnRenderMixin,
            MeasureMixin,
            EffectsMixin,
            FindMixin,
            SortMixin {}

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ContainerOptions
            extends OnRenderMixinConstructor,
            MeasureMixinConstructor,
            EffectsMixinConstructor,
            FindMixinConstructor,
            SortMixinConstructor {}
    }
}

export { };

