import { ExtensionType } from '../../extensions/Extensions';
import { type SdfShader } from '../text/sdfShader/SdfShader';
import { AbstractBitmapTextPipe } from './AbstractBitmapTextPipe';

/** @internal */
export class CanvasBitmapTextPipe extends AbstractBitmapTextPipe
{
    /** @ignore */
    public static extension: { type: ExtensionType[]; name: 'bitmapText' } = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'bitmapText',
    } as const;

    protected getSdfShader(): SdfShader | null
    {
        return null;
    }
}
