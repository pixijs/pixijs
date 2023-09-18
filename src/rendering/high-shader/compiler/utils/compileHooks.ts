export const findHooksRx = /\{\{(.*?)\}\}/g;

/**
 * takes a program string and returns an hash mapping the hooks to empty arrays
 * @param programSrc - the program containing hooks
 */
export function compileHooks(programSrc: string): Record<string, string[]>
{
    const parts: Record<string, string[]> = {};

    const partMatches = programSrc
        .match(findHooksRx)
        ?.map((hook) => hook.replace(/[{()}]/g, '')) ?? [];

    partMatches.forEach((hook) =>
    {
        parts[hook] = [];
    });

    return parts;
}
