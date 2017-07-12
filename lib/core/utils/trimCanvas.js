'use strict';

exports.__esModule = true;
exports.default = trimCanvas;
/**
 * Trim transparent borders from a canvas
 *
 * @memberof PIXI
 * @function trimCanvas
 * @private
 * @param {HTMLCanvasElement} canvas - the canvas to trim
 * @returns {object} Trim data
 */
function trimCanvas(canvas) {
    // https://gist.github.com/remy/784508

    var width = canvas.width;
    var height = canvas.height;

    var context = canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;
    var len = pixels.length;

    var bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
    };
    var i = void 0;
    var x = void 0;
    var y = void 0;

    for (i = 0; i < len; i += 4) {
        if (pixels[i + 3] !== 0) {
            x = i / 4 % width;
            y = ~~(i / 4 / width);

            if (bound.top === null) {
                bound.top = y;
            }

            if (bound.left === null) {
                bound.left = x;
            } else if (x < bound.left) {
                bound.left = x;
            }

            if (bound.right === null) {
                bound.right = x + 1;
            } else if (bound.right < x) {
                bound.right = x + 1;
            }

            if (bound.bottom === null) {
                bound.bottom = y;
            } else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }

    width = bound.right - bound.left;
    height = bound.bottom - bound.top + 1;

    var data = context.getImageData(bound.left, bound.top, width, height);

    return {
        height: height,
        width: width,
        data: data
    };
}
//# sourceMappingURL=trimCanvas.js.map