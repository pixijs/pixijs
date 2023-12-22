import { Matrix } from '../../../../maths/matrix/Matrix';
import { Bounds } from '../Bounds';

/**
 * A very simple pooling system
 * This favours performance over safety.
 * There are no checks to ensure items are returned to the pool more than once for example.
 * Used internally to maximise speed of the getBounds calculations
 * @ignore
 */
export class ObjectPool<T>
{
    private _pool: T[] = [];
    private _poolIndex = 0;
    private readonly _pooledClass: new () => T;

    constructor(pooledClass: new () => T)
    {
        this._pooledClass = pooledClass;
    }

    public get(): T
    {
        this._poolIndex--;

        if (this._poolIndex < 0)
        {
            this._poolIndex = 0;

            return new this._pooledClass();
        }

        return this._pool[this._poolIndex];
    }

    public put(item: T): void
    {
        this._pool[this._poolIndex++] = item;
    }
}

export const matrixPool = new ObjectPool(Matrix);
export const boundsPool = new ObjectPool(Bounds);
