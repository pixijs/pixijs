import { parsing } from './middleware';
import type { ExtensionMetadata } from '@pixi/core';
import { extensions, ExtensionType } from '@pixi/core';

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

extensions.add(ParsingLoader);

export { ParsingLoader };
