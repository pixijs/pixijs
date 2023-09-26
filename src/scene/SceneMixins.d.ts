declare namespace PixiMixins
{
    type LocalGlobal = import('./container/container-mixins/toLocalGlobalMixin').ToLocalGlobalMixin;
    type ChildrenHelper = import('./container/container-mixins/childrenHelperMixin').ChildrenHelperMixin;
    type OnRenderMixin = import('./container/container-mixins/onRenderMixin').OnRenderMixin;
    type MeasureMixin = import('./container/container-mixins/measureMixin').MeasureMixin;
    type EffectsMixin = import('./container/container-mixins/effectsMixin').EffectsMixin;
    type FindMixin = import('./container/container-mixins/getByLabelMixin').GetByLabelMixin;
    type SortMixin = import('./container/container-mixins/sortMixin').SortMixin;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container extends LocalGlobal, ChildrenHelper, OnRenderMixin, MeasureMixin, EffectsMixin, FindMixin, SortMixin
    {

    }
}
