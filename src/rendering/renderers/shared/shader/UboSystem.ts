import { unsafeEvalSupported } from '../../../../utils/browser/unsafeEvalSupported';
import { Buffer } from '../buffer/Buffer';
import { BufferUsage } from '../buffer/const';

import type { System } from '../system/System';
import type { UboElement, UboLayout, UniformData, UniformsSyncCallback } from './types';
import type { UniformGroup } from './UniformGroup';

export interface UboAdaptor
{
    createUboElements: (uniformData: UniformData[]) => UboLayout;
    generateUboSync: (uboElements: UboElement[]) => UniformsSyncCallback;
}

/**
 * System plugin to the renderer to manage uniform buffers.
 * @memberof rendering
 */
export class UboSystem implements System
{
    /** Cache of uniform buffer layouts and sync functions, so we don't have to re-create them */
    private _syncFunctionHash: Record<string, {
        layout: UboLayout,
        syncFunction: (uniforms: Record<string, any>, data: Float32Array, dataInt32: Int32Array, offset: number) => void
    }> = Object.create(null);

    private readonly _adaptor: UboAdaptor;

    constructor(adaptor: UboAdaptor)
    {
        this._adaptor = adaptor;

        // Validation check that this environment support `new Function`
        this._systemCheck();
    }

    /**
     * Overridable function by `pixi.js/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     * @private
     */
    private _systemCheck(): void
    {
        if (!unsafeEvalSupported())
        {
            throw new Error('Current environment does not allow unsafe-eval, '
                 + 'please use pixi.js/unsafe-eval module to enable support.');
        }
    }

    public ensureUniformGroup(uniformGroup: UniformGroup): void
    {
        const uniformData = this.getUniformGroupData(uniformGroup);

        uniformGroup.buffer ||= new Buffer({
            data: new Float32Array(uniformData.layout.size / 4),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });
    }

    public getUniformGroupData(uniformGroup: UniformGroup)
    {
        return this._syncFunctionHash[uniformGroup._signature] || this._initUniformGroup(uniformGroup);
    }

    private _initUniformGroup(uniformGroup: UniformGroup)
    {
        const uniformGroupSignature = uniformGroup._signature;

        let uniformData = this._syncFunctionHash[uniformGroupSignature];

        if (!uniformData)
        {
            const elements = Object.keys(uniformGroup.uniformStructures).map((i) => uniformGroup.uniformStructures[i]);

            const layout = this._adaptor.createUboElements(elements);

            const syncFunction = this._generateUboSync(layout.uboElements);

            uniformData = this._syncFunctionHash[uniformGroupSignature] = {
                layout,
                syncFunction
            };
        }

        return this._syncFunctionHash[uniformGroupSignature];
    }

    private _generateUboSync(
        uboElements: UboElement[],
    ): UniformsSyncCallback
    {
        return this._adaptor.generateUboSync(uboElements);
    }

    public syncUniformGroup(uniformGroup: UniformGroup, data?: Float32Array, offset?: number): boolean
    {
        const uniformGroupData = this.getUniformGroupData(uniformGroup);

        uniformGroup.buffer ||= new Buffer({
            data: new Float32Array(uniformGroupData.layout.size / 4),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        let dataInt32: Int32Array = null;

        if (!data)
        {
            data = uniformGroup.buffer.data as Float32Array;
            dataInt32 = uniformGroup.buffer.dataInt32;
        }
        offset ||= 0;

        uniformGroupData.syncFunction(uniformGroup.uniforms, data, dataInt32, offset);

        return true;
    }

    public updateUniformGroup(uniformGroup: UniformGroup): boolean
    {
        if (uniformGroup.isStatic && !uniformGroup._dirtyId) return false;
        uniformGroup._dirtyId = 0;

        const synced = this.syncUniformGroup(uniformGroup);

        uniformGroup.buffer.update();

        return synced;
    }

    public destroy(): void
    {
        this._syncFunctionHash = null;
    }
}
