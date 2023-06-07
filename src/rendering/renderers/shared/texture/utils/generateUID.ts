let uidCount = 0;

export function generateUID(): number
{
    return uidCount++;
}
