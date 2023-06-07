import { Matrix } from '../../../../maths/Matrix';
import { convertNumberToHex } from '../../../../utils/color/convertNumberToHex';
import { FillGradient } from '../../../graphics/shared/fill/FillGradient';
import { FillPattern } from '../../../graphics/shared/fill/FillPattern';
import { Texture } from '../../../renderers/shared/texture/Texture';

import type { ICanvasRenderingContext2D } from '../../../../settings/adapter/ICanvasRenderingContext2D';
import type { FillStyle } from '../../../graphics/shared/GraphicsContext';

export function getCanvasFillStyle(
    fillStyle: FillStyle,
    context: ICanvasRenderingContext2D): string | CanvasGradient | CanvasPattern
{
    if (fillStyle.texture === Texture.WHITE && !fillStyle.fill)
    {
        return convertNumberToHex(fillStyle.color);
    }
    else if (!fillStyle.fill)
    {
        // fancy set up...
        const pattern = context.createPattern(fillStyle.texture.source.resource, 'repeat');

        // create an inverted scale matrix..
        const tempMatrix = fillStyle.matrix.copyTo(Matrix.shared);

        tempMatrix.scale(fillStyle.texture.frameWidth, fillStyle.texture.frameHeight);

        pattern.setTransform(tempMatrix);

        return pattern;
    }
    else if (fillStyle.fill instanceof FillPattern)
    {
        const fillPattern = fillStyle.fill as FillPattern;

        const pattern = context.createPattern(fillPattern.texture.source.resource, 'repeat');

        const tempMatrix = fillPattern.transform.copyTo(Matrix.shared);

        tempMatrix.scale(fillPattern.texture.frameWidth, fillPattern.texture.frameHeight);

        pattern.setTransform(tempMatrix);

        return pattern;
    }
    else if (fillStyle.fill instanceof FillGradient)
    {
        const fillGradient = fillStyle.fill as FillGradient;

        if (fillGradient.type === 'linear')
        {
            const gradient = context.createLinearGradient(
                fillGradient.x0,
                fillGradient.y0,
                fillGradient.x1,
                fillGradient.y1
            );

            fillGradient.gradientStops.forEach((stop) =>
            {
                gradient.addColorStop(stop.offset, convertNumberToHex(stop.color));
            });

            return gradient;
        }
    }

    console.warn('[PixiJS] FillStyle not recognised', fillStyle);

    return 'red';
}
