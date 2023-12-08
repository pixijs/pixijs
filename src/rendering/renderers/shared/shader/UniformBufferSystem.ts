import { ExtensionType } from '../../../../extensions/Extensions';
import { unsafeEvalSupported } from '../../../../utils/browser/unsafeEvalSupported';
import { Buffer } from '../buffer/Buffer';
import { BufferUsage } from '../buffer/const';
import { createUBOElements } from './utils/createUBOElements';
import { generateUniformBufferSync } from './utils/createUniformBufferSync';

import type { System } from '../system/System';
import type { UniformGroup } from './UniformGroup';
import type { UBOElement, UniformBufferLayout } from './utils/createUBOElements';
import type { UniformsSyncCallback } from './utils/createUniformBufferSyncTypes';

export class UniformBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
            ExtensionType.CanvasSystem,
        ],
        name: 'uniformBuffer',
    } as const;

    constructor()
    {
        // Validation check that this environment support `new Function`
        this._systemCheck();
    }

    /**
     * Overrideable function by `@pixi/unsafe-eval` to silence
     * throwing an error if platform doesn't support unsafe-evals.
     * @private
     */
    private _systemCheck(): void
    {
        if (!unsafeEvalSupported())
        {
            throw new Error('Current environment does not allow unsafe-eval, '
                 + 'please use @pixi/unsafe-eval module to enable support.');
        }
    }

    /** Cache of uniform buffer layouts and sync functions, so we don't have to re-create them */
    private _syncFunctionHash: Record<string, {
        layout: UniformBufferLayout,
        syncFunction: (uniforms: Record<string, any>, data: Float32Array, offset: number) => void
    }> = Object.create(null);

    public ensureUniformGroup(uniformGroup: UniformGroup): void
    {
        if (!uniformGroup._syncFunction)
        {
            this._initUniformGroup(uniformGroup);
        }
    }

    private _initUniformGroup(uniformGroup: UniformGroup): UniformsSyncCallback
    {
        const uniformGroupSignature = uniformGroup._signature;

        let uniformData = this._syncFunctionHash[uniformGroupSignature];

        if (!uniformData)
        {
            const elements = Object.keys(uniformGroup.uniformStructures).map((i) => uniformGroup.uniformStructures[i]);

            const layout = createUBOElements(elements);

            const syncFunction = this._generateUniformBufferSync(layout.uboElements);

            uniformData = this._syncFunctionHash[uniformGroupSignature] = {
                layout,
                syncFunction
            };
        }

        uniformGroup._syncFunction = uniformData.syncFunction;

        uniformGroup.buffer = new Buffer({
            data: new Float32Array(uniformData.layout.size / 4),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });

        return uniformGroup._syncFunction;
    }

    private _generateUniformBufferSync(
        uboElements: UBOElement[],
    ): UniformsSyncCallback
    {
        return generateUniformBufferSync(uboElements);
    }

    public syncUniformGroup(uniformGroup: UniformGroup, data?: Float32Array, offset?: number): boolean
    {
        const syncFunction = uniformGroup._syncFunction || this._initUniformGroup(uniformGroup);

        data ||= (uniformGroup.buffer.data as Float32Array);
        offset ||= 0;

        syncFunction(uniformGroup.uniforms, data, offset);

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
