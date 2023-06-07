declare namespace PixiMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ICanvas
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGLRendererOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebGPURendererOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SharedRendererOptions
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SharedRenderSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface GLRenderSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface GPURenderSystems
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CanvasRenderSystems
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SharedRenderPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface GLRenderPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface GPURenderPipes
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CanvasRenderPipes
    {

    }

    type LocalGlobal = import('./scene/container-mixins/toLocalGlobalMixin').ToLocalGlobalMixin;
    type ChildrenHelper = import('./scene/container-mixins/childrenHelperMixin').ChildrenHelperMixin;
    type OnRenderMixin = import('./scene/container-mixins/onRenderMixin').OnRenderMixin;
    type MeasureMixin = import('./scene/container-mixins/measureMixin').MeasureMixin;
    type EffectsMixin = import('./scene/container-mixins/effectsMixin').EffectsMixin;
    type FindMixin = import('./scene/container-mixins/getByLabelMixin').GetByLabelMixin;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container extends LocalGlobal, ChildrenHelper, OnRenderMixin, MeasureMixin, EffectsMixin, FindMixin
    {

    }
}
