const idCounts: Record<string, number> = Object.create(null);
const idHash: Record<string, Record<string, number>> = Object.create(null);

/**
 * @param value
 * @param groupId
 * @internal
 */
export function createIdFromString(value: string, groupId: string): number
{
    const groupHash = idHash[groupId] ?? (idHash[groupId] = Object.create(null));
    let id = groupHash[value];

    if (id === undefined)
    {
        if (idCounts[groupId] === undefined)
        {
            idCounts[groupId] = 1;
        }

        groupHash[value] = id = idCounts[groupId]++;
    }

    return id;
}
