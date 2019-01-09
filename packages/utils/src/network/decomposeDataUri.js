import { DATA_URI } from '../const';

/**
 * Typedef for decomposeDataUri return object.
 *
 * @memberof PIXI.utils
 * @typedef {object} DecomposedDataUri
 * @property {string} mediaType Media type, eg. `image`
 * @property {string} subType Sub type, eg. `png`
 * @property {string} encoding Data encoding, eg. `base64`
 * @property {string} data The actual data
 */

/**
 * Split a data URI into components. Returns undefined if
 * parameter `dataUri` is not a valid data URI.
 *
 * @memberof PIXI.utils
 * @function decomposeDataUri
 * @param {string} dataUri - the data URI to check
 * @return {PIXI.utils.DecomposedDataUri|undefined} The decomposed data uri or undefined
 */
export function decomposeDataUri(dataUri)
{
    const dataUriMatch = DATA_URI.exec(dataUri);

    if (dataUriMatch)
    {
        return {
            mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : undefined,
            subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : undefined,
            charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : undefined,
            encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : undefined,
            data: dataUriMatch[5],
        };
    }

    return undefined;
}
