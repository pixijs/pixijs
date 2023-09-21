import { uid } from '../../../../utils/data/uid';
import { defaultUniformValue } from './utils/defaultUniformValue';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from '../buffer/Buffer';
import type { UniformData } from './utils/createUBOElements';

type FLOPS<T = UniformData> = T extends { value: infer V } ? V : never;

// TODO replace..T['value']
type ExtractUniformObject<T = Record<string, UniformData>> = {
    [K in keyof T]: FLOPS<T[K]>;
};

export type UniformGroupOptions = {
    ubo?: boolean;
    isStatic?: boolean;
};

export class UniformGroup<UNIFORMS extends { [key: string]: UniformData } = any> implements BindResource
{
    public static DEFAULT: UniformGroupOptions = {
        ubo: false,
        isStatic: false,
    };

    public touched = 0;

    public readonly uid = uid();

    public resourceType = 'uniformGroup';
    public resourceId = this.uid;

    public uniformStructures: UNIFORMS;
    public uniforms: ExtractUniformObject<UNIFORMS>;

    public ubo: boolean;

    public buffer?: Buffer;

    public isStatic: boolean;
    // to identify this as a uniform group
    public readonly isUniformGroup = true;

    public dirtyId = 0;

    public readonly signature: string;

    /** @internal */
    public _syncFunction?: (uniforms: UNIFORMS, data: Float32Array, offset: number) => void;

    constructor(uniformStructures: UNIFORMS, options?: UniformGroupOptions)
    {
        options = { ...UniformGroup.DEFAULT, ...options };

        this.uniformStructures = uniformStructures;

        const uniforms = {} as ExtractUniformObject<UNIFORMS>;

        for (const i in uniformStructures)
        {
            const uniformData = uniformStructures[i] as UniformData;

            uniformData.name = i;
            uniformData.size = uniformData.size ?? 1;
            uniformData.value ??= defaultUniformValue(uniformData.type, uniformData.size);

            uniforms[i] = uniformData.value as ExtractUniformObject<UNIFORMS>[keyof UNIFORMS];
        }

        this.uniforms = uniforms;

        this.dirtyId = 1;
        this.ubo = options.ubo;
        this.isStatic = options.isStatic;

        this.signature = Object.keys(uniforms).map(
            (i) => `${i}-${(uniformStructures[i as keyof typeof uniformStructures] as UniformData).type}`
        ).join('-');
    }

    public update(): void
    {
        this.dirtyId++;
        // dispatch...
    }
}
