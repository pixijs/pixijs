import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { EventSystem } from './EventSystem';
import { FederatedContainer } from './FederatedEventTarget';

extensions.add(EventSystem);
Container.mixin(FederatedContainer);
