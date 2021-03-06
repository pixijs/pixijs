/**
 * takes an array of string values and converts it to a string of defines
 * to be added to the top of a WebGL shader
 *
 * @param defines - a list of properties to inject as defines
 */
export function compileDefines(defines: string[]): string
{
    const out: string[] = [];

    const hash: Record<string, boolean> = {};

    defines.forEach((define) =>
    {
        if (!hash[define])
        {
            hash[define] = true;

            out.push(`#define ${define}`);
        }
    });

    return out.join('\n');
}
