import type { Renderer } from '../../../rendering/renderers/types';
import type { Container } from '../Container';

/** @internal */
export interface OnRenderMixinConstructor
{
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
     */
    onRender?: ((renderer: Renderer) => void | null);
}

/**
 * The OnRenderMixin interface provides a way to define a callback that is executed
 * every time the container is rendered. This is useful for adding custom rendering logic
 * or animations that need to be updated each frame.
 * @category scene
 * @standard
 */
export interface OnRenderMixin extends Required<OnRenderMixinConstructor>
{
    /** @private */
    _onRender: ((renderer: Renderer) => void) | null;
}

/** @internal */
export const onRenderMixin: Partial<Container> = {
    _onRender: null,

    set onRender(func: (renderer: Renderer) => void)
    {
        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (!func)
        {
            if (this._onRender)
            {
                renderGroup?.removeOnRender(this);
            }

            this._onRender = null;

            return;
        }

        if (!this._onRender)
        {
            renderGroup?.addOnRender(this);
        }

        this._onRender = func;
    },

    get onRender(): (renderer: Renderer) => void
    {
        return this._onRender;
    }
} as Container;
