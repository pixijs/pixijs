import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { BigPool } from '../../../utils/pool/PoolGroup';

import type { PoolItem, PoolItemConstructor } from '../../../utils/pool/Pool';
import type { Effect, EffectConstructor } from '../../scene/Effect';

interface MaskConversionTest
{
    test: (item: any) => boolean;
    maskClass: new (item: any) => Effect & PoolItem;
}

export class MaskEffectManagerClass
{
    _effectClasses: EffectConstructor[] = [];
    private tests: MaskConversionTest[] = [];
    private _initialized = false;

    init()
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

    add(test: MaskConversionTest)
    {
        this.tests.push(test);
    }

    getMaskEffect(item: any): Effect
    {
        if (!this._initialized) this.init();

        for (let i = 0; i < this.tests.length; i++)
        {
            const test = this.tests[i];

            if (test.test(item))
            {
                return BigPool.get(test.maskClass as PoolItemConstructor<Effect & PoolItem>, item);
            }
        }

        return item;
    }

    returnMaskEffect(effect: Effect & PoolItem)
    {
        BigPool.return(effect);
    }
}

export const MaskEffectManager = new MaskEffectManagerClass();

// Handle registration of extensions
extensions
    .handleByList(ExtensionType.MaskEffect, MaskEffectManager._effectClasses);
