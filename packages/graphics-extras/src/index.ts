/// <reference path="../global.d.ts" />
import { Graphics } from '@pixi/graphics';
import { drawChamferRect } from './drawChamferRect';
import { drawFilletRect } from './drawFilletRect';
import { drawRegularPolygon } from './drawRegularPolygon';
import { drawRoundedPath } from './drawRoundedPath';
import { drawRoundedPolygon } from './drawRoundedPolygon';
import { drawStar } from './drawStar';
import { drawTorus } from './drawTorus';

export interface IGraphicsExtras
{
    drawTorus: typeof drawTorus;
    drawChamferRect: typeof drawChamferRect;
    drawFilletRect: typeof drawFilletRect;
    drawRegularPolygon: typeof drawRegularPolygon;
    drawRoundedPath: typeof drawRoundedPath;
    drawRoundedPolygon: typeof drawRoundedPolygon;
    drawStar: typeof drawStar;
}

// Assign extras to Graphics
Object.defineProperties(Graphics.prototype, {
    drawTorus: { value: drawTorus },
    drawChamferRect: { value: drawChamferRect },
    drawFilletRect: { value: drawFilletRect },
    drawRegularPolygon: { value: drawRegularPolygon },
    drawRoundedPath: { value: drawRoundedPath },
    drawRoundedPolygon: { value: drawRoundedPolygon },
    drawStar: { value: drawStar },
});
