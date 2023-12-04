import type { Container } from '../Container';

export interface OnRenderMixinConstructor
{
    onRender?: (() => void | null);
}
export interface OnRenderMixin extends Required<OnRenderMixinConstructor>
{
    _onRender: (() => void) | null;
}

export const onRenderMixin: Partial<Container> = {
    _onRender: null,

    set onRender(func: () => void)
    {
        const layerGroup = this.renderGroup;

        if (!func)
        {
            if (this._onRender)
            {
                layerGroup?.removeOnRender(this);
            }

            this._onRender = null;

            return;
        }

        if (!this._onRender)
        {
            layerGroup?.addOnRender(this);
        }

        this._onRender = func;
    },

    /**
     * This callback is used when the container is rendered. This is where you should add your custom
     * logic that is needed to be run every frame.
     *
     * In v7 many users used `updateTransform` for this, however the way v8 renders objects is different
     * and "updateTransform" is no longer called every frame
     * @example
     * const container = new Container();
     * container.onRender = () => {
     *    container.rotation += 0.01;
     * };
     * @memberof scene.Container#
     */
    get onRender(): () => void
    {
        return this._onRender;
    }
} as Container;
