import { DATA_URI } from '../const';

export interface DecomposedDataUri {
    mediaType: string;
    subType: string;
    charset: string;
    encoding: string;
    data: string;
}

/**
 * @memberof PIXI.utils
 * @interface DecomposedDataUri
 */

/**
 * type, eg. `image`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} mediaType
 */

/**
 * Sub type, eg. `png`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} subType
 */

/**
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} charset
 */

/**
 * Data encoding, eg. `base64`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} encoding
 */

/**
 * The actual data
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} data
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
export function decomposeDataUri(dataUri: string): DecomposedDataUri
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
