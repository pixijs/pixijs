import { DATA_URI } from '../const';

export interface IDecomposedDataUri {
    mediaType: string;
    subType: string;
    charset: string;
    encoding: string;
    data: string;
}

/**
 * @memberof PIXI.utils
 * @interface IDecomposedDataUri
 */

/**
 * type, eg. `image`
 * @memberof PIXI.utils.IDecomposedDataUri#
 * @member {string} mediaType
 */

/**
 * Sub type, eg. `png`
 * @memberof PIXI.utils.IDecomposedDataUri#
 * @member {string} subType
 */

/**
 * @memberof PIXI.utils.IDecomposedDataUri#
 * @member {string} charset
 */

/**
 * Data encoding, eg. `base64`
 * @memberof PIXI.utils.IDecomposedDataUri#
 * @member {string} encoding
 */

/**
 * The actual data
 * @memberof PIXI.utils.IDecomposedDataUri#
 * @member {string} data
 */

/**
 * Split a data URI into components. Returns undefined if
 * parameter `dataUri` is not a valid data URI.
 *
 * @memberof PIXI.utils
 * @function decomposeDataUri
 * @param {string} dataUri - the data URI to check
 * @return {PIXI.utils.IDecomposedDataUri|undefined} The decomposed data uri or undefined
 */
export function decomposeDataUri(dataUri: string): IDecomposedDataUri
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
