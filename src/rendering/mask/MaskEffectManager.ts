import { extensions, ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';

import type { Effect, EffectConstructor } from '../../scene/container/Effect';
import type { PoolItem, PoolItemConstructor } from '../../utils/pool/Pool';

interface MaskConversionTest
{
    test: (item: any) => boolean;
    maskClass: new (item: any) => Effect & PoolItem;
}

export type MaskEffect = {mask: unknown} & Effect;

/**
 * A class that manages the conversion of masks to mask effects.
 * @memberof rendering
 * @ignore
 */
export class MaskEffectManagerClass
{
    /**
     * @private
     */
    public readonly _effectClasses: EffectConstructor[] = [];
    private readonly _tests: MaskConversionTest[] = [];
    private _initialized = false;

    public init()
    {
        if (this._initialized) return;

        this._initialized = true;

        this._effectClasses.forEach((test) =>
        {
            this.add({
                test: test.test,
                maskClass: test
            });
        });
    }

    public add(test: MaskConversionTest)
    {
        this._tests.push(test);
    }

    public getMaskEffect(item: any): MaskEffect
    {
        if (!this._initialized) this.init();

        for (let i = 0; i < this._tests.length; i++)
        {
            const test = this._tests[i];

            if (test.test(item))
            {
                return BigPool.get(test.maskClass as PoolItemConstructor<MaskEffect & PoolItem>, item);
            }
        }

        return item;
    }

    public returnMaskEffect(effect: Effect & PoolItem)
    {
        BigPool.return(effect);
    }
}

export const MaskEffectManager = new MaskEffectManagerClass();

// Handle registration of extensions
extensions
    .handleByList(ExtensionType.MaskEffect, MaskEffectManager._effectClasses);
