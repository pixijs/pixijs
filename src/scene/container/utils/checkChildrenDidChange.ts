import type { Container } from '../Container';

/**
 * This function will crawl through the container essentially check if the children have changed.
 *
 * This function checkChildrenDidChange recursively checks if any child in a Container
 * or its children has changed. It does this by comparing a generated changeId for each
 * child against a stored value in previousData.
 * The changeId is a combination of the child's uid and _didChangeId, bitwise manipulated for uniqueness.
 * If a change is detected, it updates previousData and sets didChange to true.
 * The function returns a boolean indicating if any change was detected in the entire hierarchy of children.
 * @param container - the container to check for changes
 * @param previousData - the previous data from the last check made
 * @param previousData.data - the data array
 * @param previousData.index - the index of the data array
 * @param previousData.didChange - did the data change
 */
export function checkChildrenDidChange(
    container: Container,
    previousData: {
        data: number[];
        index: number;
        didChange: boolean;
    })
{
    const children = container.children;

    for (let i = 0; i < children.length; i++)
    {
        const child = children[i];

        const uid = child.uid;
        const didChange = ((child._didViewChangeTick & 0xffff) << 16) | (child._didContainerChangeTick & 0xffff);

        const index = previousData.index;

        if (previousData.data[index] !== uid || previousData.data[index + 1] !== didChange)
        {
            previousData.data[previousData.index] = uid;
            previousData.data[previousData.index + 1] = didChange;

            previousData.didChange = true;
        }

        previousData.index = index + 2;

        if (child.children.length)
        {
            checkChildrenDidChange(child, previousData);
        }
    }

    return previousData.didChange;
}
