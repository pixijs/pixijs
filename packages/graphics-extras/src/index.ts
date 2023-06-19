/// <reference path="../global.d.ts" />
import { Graphics } from '@pixi/graphics';
import { drawChamferRect } from './drawChamferRect';
import { drawFilletRect } from './drawFilletRect';
import { drawRegularPolygon } from './drawRegularPolygon';
import { drawRoundedPolygon } from './drawRoundedPolygon';
import { drawRoundedShape } from './drawRoundedShape';
import { drawStar } from './drawStar';
import { drawTorus } from './drawTorus';

export interface IGraphicsExtras
{
    drawTorus: typeof drawTorus;
    drawChamferRect: typeof drawChamferRect;
    drawFilletRect: typeof drawFilletRect;
    drawRegularPolygon: typeof drawRegularPolygon;
    drawRoundedPolygon: typeof drawRoundedPolygon;
    drawRoundedShape: typeof drawRoundedShape;
    drawStar: typeof drawStar;
}

// Assign extras to Graphics
Object.defineProperties(Graphics.prototype, {
    drawTorus: { value: drawTorus },
    drawChamferRect: { value: drawChamferRect },
    drawFilletRect: { value: drawFilletRect },
    drawRegularPolygon: { value: drawRegularPolygon },
    drawRoundedPolygon: { value: drawRoundedPolygon },
    drawRoundedShape: { value: drawRoundedShape },
    drawStar: { value: drawStar },
});
