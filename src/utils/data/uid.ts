const uidCache: Record<string, number> = {
    default: -1,
};

type UIDNames =
    | 'default'
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
    | 'tilingSpriteView'; // ;

/**
 * Gets the next unique identifier
 * @param name - The name of the identifier.
 * @function uid
 * @returns {number} The next unique identifier to use.
 * @memberof utils
 */
export function uid(name: UIDNames = 'default'): number
{
    if (uidCache[name] === undefined)
    {
        uidCache[name] = -1;
    }

    return ++uidCache[name];
}

