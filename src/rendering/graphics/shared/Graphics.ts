import { deprecation } from '../../../utils/logging/deprecation';
import { Container } from '../../scene/Container';
import { GraphicsContext } from './GraphicsContext';
import { GraphicsView } from './GraphicsView';

import type { Matrix } from '../../../maths/Matrix';
import type { Texture } from '../../renderers/shared/texture/Texture';
import type { ContainerOptions } from '../../scene/Container';
import type { FillStyleInputs } from './GraphicsContext';

export interface GraphicsOptions extends ContainerOptions<GraphicsView>
{
    context?: GraphicsContext;
}

export class Graphics extends Container<GraphicsView>
{
    constructor(options?: GraphicsOptions | GraphicsContext)
    {
        if (options instanceof GraphicsContext)
        {
            options = { context: options };
        }

        super({
            view: new GraphicsView(options?.context),
            label: 'Graphics',
            ...options
        });
    }

    get context(): GraphicsContext
    {
        return this.view.context;
    }

    set context(context: GraphicsContext)
    {
        this.view.context = context;
    }

    private _callContextMethod(method: keyof GraphicsContext, args: any[]): this
    {
        (this.view.context as any)[method](...args);

        return this;
    }

    // --------------------------------------- GraphicsContext methods ---------------------------------------
    /** @deprecated 8.0.0 */
    public fill(color: number, alpha: number): this;
    public fill(style?: FillStyleInputs): this;
    public fill(...args: [FillStyleInputs, number?]): this
    {
        return this._callContextMethod('fill', args);
    }
    public stroke(...args: Parameters<GraphicsContext['stroke']>): this
    {
        return this._callContextMethod('stroke', args);
    }
    public texture(texture: Texture): this;
    public texture(texture: Texture, tint: number): this;
    public texture(texture: Texture, tint: number, dx: number, dy: number): this;
    public texture(texture: Texture, tint: number, dx: number, dy: number, dw: number, dh: number): this;
    public texture(texture: Texture, tint?: number, dx?: number, dy?: number, dw?: number, dh?: number): this;
    public texture(...args: [Texture, number?, number?, number?, number?, number?]): this
    {
        return this._callContextMethod('texture', args);
    }
    public setFillStyle(...args: Parameters<GraphicsContext['setFillStyle']>): this
    {
        return this._callContextMethod('setFillStyle', args);
    }
    public setStrokeStyle(...args: Parameters<GraphicsContext['setStrokeStyle']>): this
    {
        return this._callContextMethod('setStrokeStyle', args);
    }
    public beginPath(...args: Parameters<GraphicsContext['beginPath']>): this
    {
        return this._callContextMethod('beginPath', args);
    }
    public cut(...args: Parameters<GraphicsContext['cut']>): this
    {
        return this._callContextMethod('cut', args);
    }
    public arc(...args: Parameters<GraphicsContext['arc']>): this
    {
        return this._callContextMethod('arc', args);
    }
    public arcTo(...args: Parameters<GraphicsContext['arcTo']>): this
    {
        return this._callContextMethod('arcTo', args);
    }
    public arcToSvg(...args: Parameters<GraphicsContext['arcToSvg']>): this
    {
        return this._callContextMethod('arcToSvg', args);
    }
    public bezierCurveTo(...args: Parameters<GraphicsContext['bezierCurveTo']>): this
    {
        return this._callContextMethod('bezierCurveTo', args);
    }
    public closePath(...args: Parameters<GraphicsContext['closePath']>): this
    {
        return this._callContextMethod('closePath', args);
    }
    public ellipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        return this._callContextMethod('ellipse', args);
    }
    public circle(...args: Parameters<GraphicsContext['circle']>): this
    {
        return this._callContextMethod('circle', args);
    }
    public path(...args: Parameters<GraphicsContext['path']>): this
    {
        return this._callContextMethod('path', args);
    }
    public lineTo(...args: Parameters<GraphicsContext['lineTo']>): this
    {
        return this._callContextMethod('lineTo', args);
    }
    public moveTo(...args: Parameters<GraphicsContext['moveTo']>): this
    {
        return this._callContextMethod('moveTo', args);
    }
    public quadraticCurveTo(...args: Parameters<GraphicsContext['quadraticCurveTo']>): this
    {
        return this._callContextMethod('quadraticCurveTo', args);
    }
    public rect(...args: Parameters<GraphicsContext['rect']>): this
    {
        return this._callContextMethod('rect', args);
    }
    public roundRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        return this._callContextMethod('roundRect', args);
    }
    public poly(...args: Parameters<GraphicsContext['poly']>): this
    {
        return this._callContextMethod('poly', args);
    }
    public star(...args: Parameters<GraphicsContext['star']>): this
    {
        return this._callContextMethod('star', args);
    }
    public svg(...args: Parameters<GraphicsContext['svg']>): this
    {
        return this._callContextMethod('svg', args);
    }
    public restore(...args: Parameters<GraphicsContext['restore']>): this
    {
        return this._callContextMethod('restore', args);
    }
    public save(...args: Parameters<GraphicsContext['save']>): this
    {
        return this._callContextMethod('save', args);
    }
    public getTransform(...args: Parameters<GraphicsContext['getTransform']>): this
    {
        return this._callContextMethod('getTransform', args);
    }
    public resetTransform(...args: Parameters<GraphicsContext['resetTransform']>): this
    {
        return this._callContextMethod('resetTransform', args);
    }
    public rotateTransform(...args: Parameters<GraphicsContext['rotate']>): this
    {
        return this._callContextMethod('rotate', args);
    }
    public scaleTransform(...args: Parameters<GraphicsContext['scale']>): this
    {
        return this._callContextMethod('scale', args);
    }
    public setTransform(transform: Matrix): this;
    public setTransform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public setTransform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public setTransform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('setTransform', args);
    }
    public transform(transform: Matrix): this;
    public transform(a: number, b: number, c: number, d: number, dx: number, dy: number): this;
    public transform(a: number | Matrix, b?: number, c?: number, d?: number, dx?: number, dy?: number): this;
    public transform(...args: [Matrix] | [number, number, number, number, number, number]): this
    {
        return this._callContextMethod('transform', args);
    }
    public translateTransform(...args: Parameters<GraphicsContext['translate']>): this
    {
        return this._callContextMethod('translate', args);
    }
    public clear(...args: Parameters<GraphicsContext['clear']>): this
    {
        return this._callContextMethod('clear', args);
    }
    get fillStyle(): GraphicsContext['fillStyle']
    {
        return this.view.context.fillStyle;
    }
    set fillStyle(value: GraphicsContext['fillStyle'])
    {
        this.view.context.fillStyle = value;
    }
    get strokeStyle(): GraphicsContext['strokeStyle']
    {
        return this.view.context.strokeStyle;
    }
    set strokeStyle(value: GraphicsContext['strokeStyle'])
    {
        this.view.context.strokeStyle = value;
    }

    // v7 deprecations
    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawCircle(...args: Parameters<GraphicsContext['circle']>): this
    {
        deprecation('8.0.0', 'Graphics#drawCircle has been renamed to Graphics#circle');

        return this._callContextMethod('circle', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawEllipse(...args: Parameters<GraphicsContext['ellipse']>): this
    {
        deprecation('8.0.0', 'Graphics#drawEllipse has been renamed to Graphics#ellipse');

        return this._callContextMethod('ellipse', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawPolygon(...args: Parameters<GraphicsContext['poly']>): this
    {
        deprecation('8.0.0', 'Graphics#drawPolygon has been renamed to Graphics#poly');

        return this._callContextMethod('poly', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawRect(...args: Parameters<GraphicsContext['rect']>): this
    {
        deprecation('8.0.0', 'Graphics#drawRect has been renamed to Graphics#rect');

        return this._callContextMethod('rect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawRoundedRect(...args: Parameters<GraphicsContext['roundRect']>): this
    {
        deprecation('8.0.0', 'Graphics#drawRoundedRect has been renamed to Graphics#roundRect');

        return this._callContextMethod('roundRect', args);
    }

    /**
     * @param {...any} args
     * @deprecated since 8.0.0
     */
    public drawStar(...args: Parameters<GraphicsContext['star']>): this
    {
        deprecation('8.0.0', 'Graphics#drawStar has been renamed to Graphics#star');

        return this._callContextMethod('star', args);
    }
}
