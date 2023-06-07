/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { generateUID } from '../texture/utils/generateUID';

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
    static DEFAULT: UniformGroupOptions = {
        ubo: false,
        isStatic: false,
    };

    readonly uid = generateUID();

    resourceType = 'uniformGroup';
    resourceId = this.uid;

    uniformStructures: UNIFORMS;
    uniforms: ExtractUniformObject<UNIFORMS>;

    ubo: boolean;

    buffer?: Buffer;

    isStatic: boolean;
    // to identify this as a uniform group
    readonly group = true;

    dirtyId = 0;

    readonly signature: string;

    _syncFunction?: (uniforms: UNIFORMS, data: Float32Array) => void;

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

            uniforms[i]
            = uniformData.value as ExtractUniformObject<UNIFORMS>[keyof UNIFORMS]
            ?? uniformData as ExtractUniformObject<UNIFORMS>[keyof UNIFORMS];
        }

        this.uniforms = uniforms;

        this.dirtyId = 1;
        this.ubo = options.ubo;
        this.isStatic = options.isStatic;

        this.signature = Object.keys(uniforms).map(
            (i) => `${i}-${(uniformStructures[i as keyof typeof uniformStructures] as UniformData).type}`
        ).join('-');
    }

    update(): void
    {
        this.dirtyId++;
        // dispatch...
    }
}
