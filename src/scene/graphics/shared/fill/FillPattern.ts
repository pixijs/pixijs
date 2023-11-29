import { Matrix } from '../../../../maths/matrix/Matrix';
import { uid } from '../../../../utils/data/uid';

import type { WRAP_MODE } from '../../../../rendering/renderers/shared/texture/const';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';

export type PatternRepetition = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

const repetitionMap = {
    repeat: {
        addressModeU: 'repeat',
        addressModeV: 'repeat',
    },
    'repeat-x': {
        addressModeU: 'repeat',
        addressModeV: 'clamp-to-edge',
    },
    'repeat-y': {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'repeat',
    },
    'no-repeat': {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
    },
};

export class FillPattern implements CanvasPattern
{
    public readonly uid = uid('fillPattern');
    public texture: Texture;
    public transform = new Matrix();

    constructor(texture: Texture, repetition?: PatternRepetition)
    {
        this.texture = texture;

        this.transform.scale(
            1 / texture.frame.width,
            1 / texture.frame.height
        );

        if (repetition)
        {
            texture.source.style.addressModeU = repetitionMap[repetition].addressModeU as WRAP_MODE;
            texture.source.style.addressModeV = repetitionMap[repetition].addressModeV as WRAP_MODE;
        }
    }

    public setTransform(transform?: Matrix): void
    {
        const texture = this.texture;

        this.transform.copyFrom(transform);
        this.transform.invert();
        //  transform.scale
        this.transform.scale(
            1 / texture.frame.width,
            1 / texture.frame.height
        );
    }
}
