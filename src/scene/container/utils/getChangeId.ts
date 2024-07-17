import type { Container } from '../Container';

export function getChangeId(container: Container)
{
    return ((container.uid & 255) << 24)
    | (((container._didViewChangeTick % 0xfff) & 0xfff) << 12)
    | ((container._didContainerChangeTick % 0xfff) & 0xfff);
}
