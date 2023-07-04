declare namespace PixiMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ICanvas
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RendererOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGLOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGPUOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RendererSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGLSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGPUSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CanvasSystems
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RendererPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGLPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGPUPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CanvasPipes
    {

    }

    type LocalGlobal = import('./scene/container-mixins/toLocalGlobalMixin').ToLocalGlobalMixin;
    type ChildrenHelper = import('./scene/container-mixins/childrenHelperMixin').ChildrenHelperMixin;
    type OnRenderMixin = import('./scene/container-mixins/onRenderMixin').OnRenderMixin;
    type MeasureMixin = import('./scene/container-mixins/measureMixin').MeasureMixin;
    type EffectsMixin = import('./scene/container-mixins/effectsMixin').EffectsMixin;
    type FindMixin = import('./scene/container-mixins/getByLabelMixin').GetByLabelMixin;
    type SortMixin = import('./scene/container-mixins/sortMixin').SortMixin;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container extends LocalGlobal, ChildrenHelper, OnRenderMixin, MeasureMixin, EffectsMixin, FindMixin, SortMixin
    {

    }
}
