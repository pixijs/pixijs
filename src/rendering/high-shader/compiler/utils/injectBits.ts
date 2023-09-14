/**
 * takes a shader src and replaces any hooks with the HighFragment code.
 * @param templateSrc - the program src template
 * @param fragmentParts - the fragments to inject
 */
export function injectBits(templateSrc: string, fragmentParts: Record<string, string[]>): string
{
    let out = templateSrc;

    for (const i in fragmentParts)
    {
        const parts = fragmentParts[i];

        const toInject = parts.join('\n');

        if (toInject.length)
        {
            out = out.replace(`{{${i}}}`, `//-----${i} START-----//\n${parts.join('\n')}\n//----${i} FINISH----//`);
        }

        else
        {
            out = out.replace(`{{${i}}}`, '');
        }
    }

    return out;
}
