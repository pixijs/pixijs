import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { serializeContainerMixin } from './mixins/serializeContainerMixin';

extensions.mixin(Container, serializeContainerMixin);
