declare namespace PixiMixins
{
    type LocalGlobal = import('./container/container-mixins/toLocalGlobalMixin').ToLocalGlobalMixin;
    type ChildrenHelper = import('./container/container-mixins/childrenHelperMixin').ChildrenHelperMixin;
    type OnRenderMixin = import('./container/container-mixins/onRenderMixin').OnRenderMixin;
    type MeasureMixin = import('./container/container-mixins/measureMixin').MeasureMixin;
    type EffectsMixin = import('./container/container-mixins/effectsMixin').EffectsMixin;
    type FindMixin = import('./container/container-mixins/findMixin').FindMixin;
    type SortMixin = import('./container/container-mixins/sortMixin').SortMixin;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container
        extends LocalGlobal,
        ChildrenHelper,
        OnRenderMixin,
        MeasureMixin,
        EffectsMixin,
        FindMixin,
        SortMixin {}

    type OnRenderMixinConstructor = import('./container/container-mixins/onRenderMixin').OnRenderMixinConstructor;
    type MeasureMixinConstructor = import('./container/container-mixins/measureMixin').MeasureMixinConstructor;
    type EffectsMixinConstructor = import('./container/container-mixins/effectsMixin').EffectsMixinConstructor;
    type FindMixinConstructor = import('./container/container-mixins/findMixin').FindMixinConstructor;
    type SortMixinConstructor = import('./container/container-mixins/sortMixin').SortMixinConstructor;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ContainerOptions
        extends OnRenderMixinConstructor,
        MeasureMixinConstructor,
        EffectsMixinConstructor,
        FindMixinConstructor,
        SortMixinConstructor {}
}
