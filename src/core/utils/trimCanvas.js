/**
 * Trim transparent borders from a canvas
 *
 * @memberof PIXI
 * @function trimCanvas
 * @private
 * @param {HTMLCanvasElement} canvas - the canvas to trim
 * @returns {object} Trim data
 */
export default function trimCanvas(canvas)
{
    // https://gist.github.com/remy/784508
    const context = canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    const bound = {
        top: null,
        left: null,
        right: null,
        bottom: null,
    };
    let i;
    let x;
    let y;

    for (i = 0; i < l; i += 4)
    {
        if (pixels.data[i + 3] !== 0)
        {
            x = (i / 4) % canvas.width;
            y = ~~((i / 4) / canvas.width);

            if (bound.top === null)
            {
                bound.top = y;
            }

            if (bound.left === null)
            {
                bound.left = x;
            }
            else if (x < bound.left)
            {
                bound.left = x;
            }

            if (bound.right === null)
            {
                bound.right = x + 1;
            }
            else if (bound.right < x)
            {
                bound.right = x + 1;
            }

            if (bound.bottom === null)
            {
                bound.bottom = y;
            }
            else if (bound.bottom < y)
            {
                bound.bottom = y;
            }
        }
    }

    const height = bound.bottom - bound.top + 1;
    const width = bound.right - bound.left;
    const data = context.getImageData(bound.left, bound.top, width, height);

    return {
        height,
        width,
        data,
    };
}
