import { Color } from '../../../../color/Color';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { warn } from '../../../../utils/logging/warn';
import { FillGradient } from '../../../graphics/shared/fill/FillGradient';
import { FillPattern } from '../../../graphics/shared/fill/FillPattern';

import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { ConvertedFillStyle } from '../../../graphics/shared/FillTypes';

export function getCanvasFillStyle(
    fillStyle: ConvertedFillStyle,
    context: ICanvasRenderingContext2D): string | CanvasGradient | CanvasPattern
{
    if (fillStyle.texture === Texture.WHITE && !fillStyle.fill)
    {
        return Color.shared.setValue(fillStyle.color).toHex();
    }
    else if (!fillStyle.fill)
    {
        // fancy set up...
        const pattern = context.createPattern(fillStyle.texture.source.resource, 'repeat');

        // create an inverted scale matrix..
        const tempMatrix = fillStyle.matrix.copyTo(Matrix.shared);

        tempMatrix.scale(fillStyle.texture.frame.width, fillStyle.texture.frame.height);

        pattern.setTransform(tempMatrix);

        return pattern;
    }
    else if (fillStyle.fill instanceof FillPattern)
    {
        const fillPattern = fillStyle.fill;

        const pattern = context.createPattern(fillPattern.texture.source.resource, 'repeat');

        const tempMatrix = fillPattern.transform.copyTo(Matrix.shared);

        tempMatrix.scale(
            fillPattern.texture.frame.width,
            fillPattern.texture.frame.height
        );

        pattern.setTransform(tempMatrix);

        return pattern;
    }
    else if (fillStyle.fill instanceof FillGradient)
    {
        const fillGradient = fillStyle.fill;

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
                gradient.addColorStop(stop.offset, Color.shared.setValue(stop.color).toHex());
            });

            return gradient;
        }
    }

    // #if _DEBUG
    warn('FillStyle not recognised', fillStyle);
    // #endif

    return 'red';
}
