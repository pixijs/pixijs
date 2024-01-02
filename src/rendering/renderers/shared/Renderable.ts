import type { Container } from '../../../scene/container/Container';
import type { View } from './view/View';

export interface ContainerWithView extends Container, View
{
}
