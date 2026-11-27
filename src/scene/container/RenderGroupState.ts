import { Matrix } from '../../maths/matrix/Matrix';
import { multiplyColors } from './utils/multiplyColors';

/**
 * Where a render group is, and the color it is tinted with, relative to a scene or to a render.
 * @internal
 */
export class RenderGroupState
{
    public readonly transform = new Matrix();
    public color = 0xffffff;
    public alpha = 1;
    public colorAlpha = 0xffffffff;

    /**
     * Sets this from a container's values, relative to the state of its parent render group if given.
     * @param transform
     * @param color
     * @param alpha
     * @param parent
     */
    public set(transform: Matrix, color: number, alpha: number, parent?: RenderGroupState): void
    {
        if (parent)
        {
            this.transform.appendFrom(transform, parent.transform);
            color = multiplyColors(color, parent.color);
            alpha *= parent.alpha;
        }
        else
        {
            this.transform.copyFrom(transform);
        }

        // eslint-disable-next-line no-nested-ternary
        alpha = alpha < 0 ? 0 : (alpha > 1 ? 1 : alpha);

        this.color = color;
        this.alpha = alpha;
        this.colorAlpha = color + (((alpha * 255) | 0) << 24);
    }

    public copyFrom(state: RenderGroupState): void
    {
        this.transform.copyFrom(state.transform);
        this.color = state.color;
        this.alpha = state.alpha;
        this.colorAlpha = state.colorAlpha;
    }
}
