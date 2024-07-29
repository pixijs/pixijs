/**
 * nulls all slots in an array from a certain index.
 * assume that when a null item is hit, the rest are also null.
 * Which will be the case for where this is used!
 * @param list - the array to clean
 * @param index - the index to start from
 */
export function clearList(list: Array<unknown>, index?: number)
{
    index ||= 0;

    for (let j = index; j < list.length; j++)
    {
        if (list[j])
        {
            list[j] = null;
        }
        else
        {
            break;
        }
    }
}
