const uidCache: Record<string, number> = {
    default: -1,
};

/**
 * The names of the unique identifiers. These are used to create unique identifiers for different types of objects.
 * @category utils
 * @internal
 */
export type UIDNames =
    | 'default'
    | 'resource'
    | 'texture'
    | 'textureSource'
    | 'textureResource'
    | 'batcher' //
    | 'graphicsContext' //
    | 'graphicsView' //
    | 'graphicsPath' //
    | 'fillGradient' //
    | 'fillPattern' //
    | 'meshView' //
    | 'renderable' //
    | 'buffer' //
    | 'bufferResource' //
    | 'geometry'
    | 'instructionSet' //
    | 'renderTarget' //
    | 'uniform' //
    | 'spriteView' //
    | 'textView' //
    | 'tilingSpriteView' //
    | 'shader' //
    | 'renderer';

/**
 * Gets the next unique identifier
 * @param name - The name of the identifier.
 * @returns {number} The next unique identifier to use.
 * @category utils
 * @internal
 */
export function uid(name: UIDNames = 'default'): number
{
    if (uidCache[name] === undefined)
    {
        uidCache[name] = -1;
    }

    return ++uidCache[name];
}

/**
 * Resets the next unique identifier to 0. This is used for some tests, dont touch or things WILL explode :)
 * @internal
 */
export function resetUids(): void
{
    for (const key in uidCache)
    {
        delete uidCache[key];
    }
}
