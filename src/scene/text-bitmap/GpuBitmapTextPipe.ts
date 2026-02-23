import { ExtensionType } from '../../extensions/Extensions';
import { SdfShader } from '../text/sdfShader/SdfShader';
import { AbstractBitmapTextPipe } from './AbstractBitmapTextPipe';

/** @internal */
export class BitmapTextPipe extends AbstractBitmapTextPipe
{
    /** @ignore */
    public static extension: { type: ExtensionType[]; name: 'bitmapText' } = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
        ],
        name: 'bitmapText',
    } as const;

    protected getSdfShader(): SdfShader | null
    {
        return new SdfShader(this._renderer.limits.maxBatchableTextures);
    }
}
