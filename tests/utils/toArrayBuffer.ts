import fs from 'fs';
import path from 'path';

/**
 * Return a file in ./assets as an array buffer
 * @param file
 */
function toArrayBuffer(file: string): ArrayBuffer
{
    const buffer = fs.readFileSync(path.resolve(__dirname, 'assets', file));
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buffer.length; ++i)
    {
        view[i] = buffer[i];
    }

    return ab;
}

export { toArrayBuffer };
