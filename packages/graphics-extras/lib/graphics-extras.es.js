/*!
 * @pixi/graphics-extras - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/graphics-extras is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Graphics } from '@pixi/graphics';

/**
 * Draw a torus shape, like a donut. Can be used for something like a circle loader.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawTorus
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} innerRadius - Inner circle radius
 * @param {number} outerRadius - Outer circle radius
 * @param {number} [startArc=0] - Where to begin sweep, in radians, 0.0 = to the right
 * @param {number} [endArc=Math.PI*2] - Where to end sweep, in radians
 * @return {PIXI.Graphics}
 */
function drawTorus(x, y, innerRadius, outerRadius, startArc, endArc) {
    if (startArc === void 0) { startArc = 0; }
    if (endArc === void 0) { endArc = Math.PI * 2; }
    if (Math.abs(endArc - startArc) >= Math.PI * 2) {
        return this
            .drawCircle(x, y, outerRadius)
            .beginHole()
            .drawCircle(x, y, innerRadius)
            .endHole();
    }
    this.finishPoly();
    this
        .arc(x, y, innerRadius, endArc, startArc, true)
        .arc(x, y, outerRadius, startArc, endArc, false)
        .finishPoly();
    return this;
}

/**
 * Draw Rectangle with chamfer corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawChamferRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} chamfer - accept negative or positive values
 * @return {PIXI.Graphics} Returns self.
 */
function drawChamferRect(x, y, width, height, chamfer) {
    if (chamfer === 0) {
        return this.drawRect(x, y, width, height);
    }
    var maxChamfer = Math.min(width, height) / 2;
    var inset = Math.min(maxChamfer, Math.max(-maxChamfer, chamfer));
    var right = x + width;
    var bottom = y + height;
    var dir = inset < 0 ? -inset : 0;
    var size = Math.abs(inset);
    return this
        .moveTo(x, y + size)
        .arcTo(x + dir, y + dir, x + size, y, size)
        .lineTo(right - size, y)
        .arcTo(right - dir, y + dir, right, y + size, size)
        .lineTo(right, bottom - size)
        .arcTo(right - dir, bottom - dir, x + width - size, bottom, size)
        .lineTo(x + size, bottom)
        .arcTo(x + dir, bottom - dir, x, bottom - size, size)
        .closePath();
}

/**
 * Draw Rectangle with fillet corners.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawFilletRect
 * @param {number} x - Upper left corner of rect
 * @param {number} y - Upper right corner of rect
 * @param {number} width - Width of rect
 * @param {number} height - Height of rect
 * @param {number} fillet - non-zero real number, size of corner cutout
 * @return {PIXI.Graphics} Returns self.
 */
function drawFilletRect(x, y, width, height, fillet) {
    if (fillet <= 0) {
        return this.drawRect(x, y, width, height);
    }
    var inset = Math.min(fillet, Math.min(width, height) / 2);
    var right = x + width;
    var bottom = y + height;
    var points = [
        x + inset, y,
        right - inset, y,
        right, y + inset,
        right, bottom - inset,
        right - inset, bottom,
        x + inset, bottom,
        x, bottom - inset,
        x, y + inset ];
    // Remove overlapping points
    for (var i = points.length - 1; i >= 2; i -= 2) {
        if (points[i] === points[i - 2] && points[i - 1] === points[i - 3]) {
            points.splice(i - 1, 2);
        }
    }
    return this.drawPolygon(points);
}

/**
 * Draw a regular polygon where all sides are the same length.
 *
 * _Note: Only available with **@pixi/graphics-extras**._
 *
 * @method PIXI.Graphics#drawRegularPolygon
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Polygon radius
 * @param {number} sides - Minimum value is 3
 * @param {number} rotation - Starting rotation values in radians..
 * @return {PIXI.Graphics}
 */
function drawRegularPolygon(x, y, radius, sides, rotation) {
    if (rotation === void 0) { rotation = 0; }
    sides = Math.max(sides | 0, 3);
    var startAngle = (-1 * Math.PI / 2) + rotation;
    var delta = (Math.PI * 2) / sides;
    var polygon = [];
    for (var i = 0; i < sides; i++) {
        var angle = (i * delta) + startAngle;
        polygon.push(x + (radius * Math.cos(angle)), y + (radius * Math.sin(angle)));
    }
    return this.drawPolygon(polygon);
}

// Assign extras to Graphics
Object.defineProperties(Graphics.prototype, {
    drawTorus: { value: drawTorus },
    drawChamferRect: { value: drawChamferRect },
    drawFilletRect: { value: drawFilletRect },
    drawRegularPolygon: { value: drawRegularPolygon },
});
//# sourceMappingURL=graphics-extras.es.js.map
