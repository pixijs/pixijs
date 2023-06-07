import { Matrix } from '../../../maths/Matrix';
import { Rectangle } from '../../../maths/shapes/Rectangle';

// TODO optimisations
// 1 - setMatrix could set a reference directly, this would save a copy op per object
// 2 - push and pop matrix could be optimised to use an index counter
// 3 - get rectangle could use a dirty flag, rather than setting the data each time is called
// 4 - push matrix can avoid the copy op
// 5 - pop matrix can avoid the copy op
// 6 - getFrame ALWAYS assumes a matrix, could be optimised to avoid the matrix calculation if not needed
export class Bounds
{
    public minX = Infinity;

    public minY = Infinity;

    public maxX = -Infinity;

    public maxY = -Infinity;

    // todo optimise.. lots of bounds wont need this!
    matrixStack: Matrix[] = [];
    matrix = new Matrix();

    private _rectangle: Rectangle;

    constructor(minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity)
    {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    get rectangle(): Rectangle
    {
        if (!this._rectangle)
        {
            this._rectangle = new Rectangle();
        }

        const rectangle = this._rectangle;

        if (this.minX > this.maxX || this.minY > this.maxY)
        {
            rectangle.x = 0;
            rectangle.y = 0;
            rectangle.width = 0;
            rectangle.height = 0;
        }
        else
        {
            rectangle.x = this.minX;
            rectangle.y = this.minY;
            rectangle.width = this.maxX - this.minX;
            rectangle.height = this.maxY - this.minY;
        }

        return rectangle;
    }

    clear(): void
    {
        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = -Infinity;
        this.maxY = -Infinity;

        this.matrixStack.length = 0;
        this.matrix.identity();
    }

    pushMatrix(matrix: Matrix)
    {
        this.matrixStack.push(matrix);

        if (this.matrixStack.length > 1)
        {
            this.matrix.copyFrom(this.matrixStack[this.matrixStack.length - 2]);

            this.matrix.append(matrix);
        }
        else
        {
            this.matrix.copyFrom(matrix);
        }
    }

    popMatrix()
    {
        this.matrixStack.pop();

        if (this.matrixStack.length > 1)
        {
            this.matrix.copyFrom(this.matrixStack[this.matrixStack.length - 2]);

            this.matrix.append(this.matrixStack[this.matrixStack.length - 1]);
        }
        else if (this.matrixStack.length === 1)
        {
            this.matrix.copyFrom(this.matrixStack[0]);
        }
        else
        {
            this.matrix.identity();
        }
    }

    setMatrix(matrix: Matrix): void
    {
        this.matrix.copyFrom(matrix);
    }

    set(x0: number, y0: number, x1: number, y1: number)
    {
        this.minX = x0;
        this.minY = y0;
        this.maxX = x1;
        this.maxY = y1;
    }

    /**
     * Adds sprite frame
     * @param x0 - left X of frame
     * @param y0 - top Y of frame
     * @param x1 - right X of frame
     * @param y1 - bottom Y of frame
     */
    addFrame(x0: number, y0: number, x1: number, y1: number)
    {
        const matrix = this.matrix;

        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;
        const tx = matrix.tx;
        const ty = matrix.ty;

        let minX = this.minX;
        let minY = this.minY;
        let maxX = this.maxX;
        let maxY = this.maxY;

        let x = (a * x0) + (c * y0) + tx;
        let y = (b * x0) + (d * y0) + ty;

        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;

        x = (a * x1) + (c * y0) + tx;
        y = (b * x1) + (d * y0) + ty;
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;

        x = (a * x0) + (c * y1) + tx;
        y = (b * x0) + (d * y1) + ty;
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;

        x = (a * x1) + (c * y1) + tx;
        y = (b * x1) + (d * y1) + ty;
        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    addRect(rect: Rectangle)
    {
        this.addFrame(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
    }

    addBounds(bounds: Bounds)
    {
        this.addFrame(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    }

    addBoundsMask(mask: Bounds): void
    {
        this.minX = this.minX > mask.minX ? this.minX : mask.minX;
        this.minY = this.minY > mask.minY ? this.minY : mask.minY;
        this.maxX = this.maxX < mask.maxX ? this.maxX : mask.maxX;
        this.maxY = this.maxY < mask.maxY ? this.maxY : mask.maxY;
    }

    applyMatrix(matrix: Matrix): void
    {
        const minX = this.minX;
        const minY = this.minY;
        const maxX = this.maxX;
        const maxY = this.maxY;

        // multiple bounds by matrix
        const { a, b, c, d, tx, ty } = matrix;

        let x = (a * minX) + (c * minY) + tx;
        let y = (b * minX) + (d * minY) + ty;

        this.minX = x;
        this.minY = y;
        this.maxX = x;
        this.maxY = y;

        x = (a * maxX) + (c * minY) + tx;
        y = (b * maxX) + (d * minY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;

        x = (a * minX) + (c * maxY) + tx;
        y = (b * minX) + (d * maxY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;

        x = (a * maxX) + (c * maxY) + tx;
        y = (b * maxX) + (d * maxY) + ty;
        this.minX = x < this.minX ? x : this.minX;
        this.minY = y < this.minY ? y : this.minY;
        this.maxX = x > this.maxX ? x : this.maxX;
        this.maxY = y > this.maxY ? y : this.maxY;
    }

    fit(rect: Rectangle): this
    {
        if (this.minX < rect.left) this.minX = rect.left;
        if (this.maxX > rect.right) this.maxX = rect.right;

        if (this.minY < rect.top) this.minY = rect.top;
        if (this.maxY > rect.bottom) this.maxY = rect.bottom;

        return this;
    }

    pad(paddingX: number, paddingY: number = paddingX): this
    {
        this.minX -= paddingX;
        this.maxX += paddingX;

        this.minY -= paddingY;
        this.maxY += paddingY;

        return this;
    }

    ceil(): this
    {
        this.minX = Math.floor(this.minX);
        this.minY = Math.floor(this.minY);
        this.maxX = Math.ceil(this.maxX);
        this.maxY = Math.ceil(this.maxY);

        return this;
    }

    clone(): Bounds
    {
        return new Bounds(this.minX, this.minY, this.maxX, this.maxY);
    }

    scale(x: number, y: number = x): this
    {
        this.minX *= x;
        this.minY *= y;
        this.maxX *= x;
        this.maxY *= y;

        return this;
    }

    get x(): number
    {
        return this.minX;
    }

    get y(): number
    {
        return this.minY;
    }

    get width(): number
    {
        return this.maxX - this.minX;
    }

    get height(): number
    {
        return this.maxY - this.minY;
    }

    get isPositive(): boolean
    {
        return (this.maxX - this.minX > 0) && (this.maxY - this.minY > 0);
    }

    get isValid(): boolean
    {
        return (this.minX + this.minY !== Infinity);
    }

    /**
     * Adds screen vertices from array
     * @param vertexData - calculated vertices
     * @param beginOffset - begin offset
     * @param endOffset - end offset, excluded
     */
    addVertexData(vertexData: Float32Array, beginOffset: number, endOffset: number): void
    {
        let minX = this.minX;
        let minY = this.minY;
        let maxX = this.maxX;
        let maxY = this.maxY;

        const matrix = this.matrix;

        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;
        const tx = matrix.tx;
        const ty = matrix.ty;

        for (let i = beginOffset; i < endOffset; i += 2)
        {
            const localX = vertexData[i];
            const localY = vertexData[i + 1];

            const x = (a * localX) + (c * localY) + tx;
            const y = (b * localX) + (d * localY) + ty;

            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    toString(): string
    {
        // eslint-disable-next-line max-len
        return `[@pixi:Bounds minX=${this.minX} minY=${this.minY} maxX=${this.maxX} maxY=${this.maxY} width=${this.width} height=${this.height}]`;
    }
}

