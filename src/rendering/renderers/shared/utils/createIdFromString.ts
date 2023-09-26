const idCounts: Record<string, number> = Object.create(null);
const idHash: Record<string, number> = Object.create(null);

export function createIdFromString(value: string, groupId: string): number
{
    let id = idHash[value];

    if (id === undefined)
    {
        if (idCounts[groupId] === undefined)
        {
            idCounts[groupId] = 1;
        }

        idHash[value] = id = idCounts[groupId]++;
    }

    return id;
}
