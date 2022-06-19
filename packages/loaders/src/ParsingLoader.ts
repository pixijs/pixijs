import { parsing } from './middleware';
import { ExtensionMetadata, ExtensionType } from '@pixi/core';

/**
 * Parse any blob into more usable objects (e.g. Image).
 * @memberof PIXI
 */
class ParsingLoader
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Loader;

    static use = parsing;
}

export { ParsingLoader };
