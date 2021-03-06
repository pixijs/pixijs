import type { HighFragment } from '../HighFragment';

const findExtensionsRegex = /\s*?\#extension(.|)*?\n/g;
const findUBORegex = /UBO:(.)*/g;

function getVariables(
    highFragments: HighFragment[],
    header: 'vertex' | 'fragment',
    header2: 'vertex2' | 'fragment2',
    isWebGL2: boolean): string
{
    return highFragments.filter((f) => f[header]?.header)
        .map((fragment) => (isWebGL2
            && fragment[header2]
            ? fragment[header2].header
            : fragment[header].header))
        .join('\n');
}

export interface CompiledHeader
{
    vertex: {
        extensions: string;
        variables: string;
    };

    fragment: {
        extensions: string;
        variables: string;
    };
}

/**
 * generates a header for our shader by combining all the headers in the high fragments
 * returns the vertex and fragment sources to add to the shader.
 * @param highFragments - the highFragments to extract generate a header from
 * @param isWebGL2 - if true output will prefer vertex2 or fragment2 falling back to vertex of fragment if they are not there
 *
 */
export function compileHeader(highFragments: HighFragment[], isWebGL2: boolean): CompiledHeader
{
    // process the vertex
    let vertexVariables = getVariables(highFragments, 'vertex', 'vertex2', isWebGL2);

    // pull out the extensions
    const vertexExtensions = vertexVariables.match(findExtensionsRegex)?.join('\n') ?? '';

    vertexVariables = vertexVariables
        .replace(findExtensionsRegex, '')
        .replace(/ +(?= )/g, '');

    const vertexUbos = vertexVariables.match(findUBORegex);

    vertexVariables = vertexVariables.replace(findUBORegex, '');

    // process the vertex
    let fragmentVariables = getVariables(highFragments, 'fragment', 'fragment2', isWebGL2);

    // pull out the extensions
    const fragmentExtensions = fragmentVariables.match(findExtensionsRegex)?.join('\n') ?? '';

    fragmentVariables = fragmentVariables.replace(findExtensionsRegex, '');
    fragmentVariables = fragmentVariables.replace(/ +(?= )/g, '');

    const fragmentUbos = fragmentVariables.match(findUBORegex);

    fragmentVariables = fragmentVariables.replace(findUBORegex, '');

    const vertexOutputHeader: string[] = [];
    const vertexUboMap: Record<string, string[]> = {};

    if (vertexUbos)
    {
        vertexUbos.forEach((line) =>
        {
            const split = line.split(' ');

            const uboTag = split.shift();

            const uboValue = uboTag.split(':')[1];

            if (isWebGL2)
            {
                if (!vertexUboMap[uboValue])
                {
                    vertexUboMap[uboValue] = [];
                }

                split.shift();

                vertexUboMap[uboValue].push(split.join(' '));
            }
            else
            {
                vertexOutputHeader.push(split.join(' '));
            }
        });
    }

    const fragmentOutputHeader: string[] = [];
    const fragmentUboMap: Record<string, string[]> = {};

    if (fragmentUbos)
    {
        fragmentUbos.forEach((line) =>
        {
            const split = line.split(' ');

            const uboTag = split.shift();

            const uboValue = uboTag.split(':')[1];

            if (isWebGL2)
            {
                if (!fragmentUboMap[uboValue])
                {
                    fragmentUboMap[uboValue] = [];
                }

                split.shift();

                fragmentUboMap[uboValue].push(split.join(' '));
            }
            else
            {
                fragmentOutputHeader.push(split.join(' '));
            }
        });
    }

    // merge em up...
    for (const i in vertexUboMap)
    {
        // merge!
        if (fragmentUboMap[i])
        {
            vertexUboMap[i].push(...fragmentUboMap[i]);
            vertexUboMap[i] = vertexUboMap[i].filter((item, pos, self) =>
                self.indexOf(item) === pos);

            fragmentUboMap[i] = vertexUboMap[i];
        }
    }

    for (const i in vertexUboMap)
    {
        const uboCollection = vertexUboMap[i];

        vertexOutputHeader.push(
            `uniform ${i} {\n`,
            ...uboCollection,
            '\n};',
        );
    }

    for (const i in fragmentUboMap)
    {
        const uboCollection = fragmentUboMap[i];

        fragmentOutputHeader.push(
            `uniform ${i} {\n`,
            ...uboCollection,
            '\n};',
        );
    }

    vertexVariables += `\n${vertexOutputHeader.join('\n')}`;
    fragmentVariables += `\n${fragmentOutputHeader.join('\n')}`;

    return {
        vertex: {
            variables: vertexVariables,
            extensions: vertexExtensions,
        },
        fragment: {
            variables: fragmentVariables,
            extensions: fragmentExtensions,
        },
    };
}
