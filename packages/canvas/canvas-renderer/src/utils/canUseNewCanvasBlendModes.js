/**
 * Creates a little colored canvas
 *
 * @ignore
 * @param {string} color - The color to make the canvas
 * @return {canvas} a small canvas element
 */
function createColoredCanvas(color)
{
    const canvas = document.createElement('canvas');

    canvas.width = 6;
    canvas.height = 1;

    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.fillRect(0, 0, 6, 1);

    return canvas;
}

/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @return {boolean} whether they are supported
 */
export default function canUseNewCanvasBlendModes()
{
    if (typeof document === 'undefined')
    {
        return false;
    }

    const magenta = createColoredCanvas('#ff00ff');
    const yellow = createColoredCanvas('#ffff00');

    const canvas = document.createElement('canvas');

    canvas.width = 6;
    canvas.height = 1;

    const context = canvas.getContext('2d');

    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    const imageData = context.getImageData(2, 0, 1, 1);

    if (!imageData)
    {
        return false;
    }

    const data = imageData.data;

    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
}
