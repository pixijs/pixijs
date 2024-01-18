export interface StructsAndGroups
{
    groups: {
        group: number;
        binding: number;
        name: string;
        isUniform: boolean;
        type: string;
    }[];
    structs: {
        name: string;
        members: Record<string, string>;
    }[];
}

export function extractStructAndGroups(wgsl: string): StructsAndGroups
{
    // Patterns for parsing the WGSL file
    const linePattern = /(^|[^/])@(group|binding)\(\d+\)[^;]+;/g;
    const groupPattern = /@group\((\d+)\)/;
    const bindingPattern = /@binding\((\d+)\)/;
    const namePattern = /var(<[^>]+>)? (\w+)/;
    const typePattern = /:\s*(\w+)/;
    const structPattern = /struct\s+(\w+)\s*{([^}]+)}/g;
    const structMemberPattern = /(\w+)\s*:\s*([\w\<\>]+)/g;
    const structName = /struct\s+(\w+)/;

    // Find the @group and @binding annotations
    const groups = wgsl.match(linePattern)?.map((item) => ({
        group: parseInt(item.match(groupPattern)[1], 10),
        binding: parseInt(item.match(bindingPattern)[1], 10),
        name: item.match(namePattern)[2],
        isUniform: item.match(namePattern)[1] === '<uniform>',
        type: item.match(typePattern)[1],
    }));

    if (!groups)
    {
        return {
            groups: [],
            structs: [],
        };
    }

    // Find the structs
    const structs = wgsl
        .match(structPattern)
        ?.map((struct) =>
        {
            const name = struct.match(structName)[1];
            const members = struct.match(structMemberPattern).reduce((acc: Record<string, string>, member) =>
            {
                const [name, type] = member.split(':');

                acc[name.trim()] = type.trim();

                return acc;
            }, {});

            if (!members)
            {
                return null;
            }

            return { name, members };
            // Only include the structs mentioned in the @group/@binding annotations
        })
        .filter(({ name }) => groups.some((group) => group.type === name)) ?? [];

    return {
        groups,
        structs,
    };
}
