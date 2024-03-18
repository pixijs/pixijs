import type { StructsAndGroups } from './extractStructAndGroups';

export function removeStructAndGroupDuplicates(
    vertexStructsAndGroups: StructsAndGroups,
    fragmentStructsAndGroups: StructsAndGroups
)
{
    const structNameSet = new Set();
    const dupeGroupKeySet = new Set();

    const structs = [...vertexStructsAndGroups.structs, ...fragmentStructsAndGroups.structs]
        .filter((struct) =>
        {
            if (structNameSet.has(struct.name))
            {
                return false;
            }
            structNameSet.add(struct.name);

            return true;
        });

    const groups = [...vertexStructsAndGroups.groups, ...fragmentStructsAndGroups.groups]
        .filter((group) =>
        {
            const key = `${group.name}-${group.binding}`;

            if (dupeGroupKeySet.has(key))
            {
                return false;
            }
            dupeGroupKeySet.add(key);

            return true;
        });

    return { structs, groups };
}
