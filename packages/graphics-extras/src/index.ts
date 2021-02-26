import { Graphics } from '@pixi/graphics';
import { drawTorus } from './drawTorus';
import { drawChamferRect } from './drawChamferRect';
import { drawFilletRect } from './drawFilletRect';
import { drawRegularPolygon } from './drawRegularPolygon';
import { drawStar } from './drawStar';

export interface IGraphicsExtras {
    drawTorus: typeof drawTorus;
    drawChamferRect: typeof drawChamferRect;
    drawFilletRect: typeof drawFilletRect;
    drawRegularPolygon: typeof drawRegularPolygon;
    drawStar: typeof drawStar;
}

// Assign extras to Graphics
Object.defineProperties(Graphics.prototype, {
    drawTorus: { value: drawTorus },
    drawChamferRect: { value: drawChamferRect },
    drawFilletRect: { value: drawFilletRect },
    drawRegularPolygon: { value: drawRegularPolygon },
    drawStar: { value: drawStar },
});
