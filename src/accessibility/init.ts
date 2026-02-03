import { extensions } from '../extensions/Extensions';
import { Container } from '../scene/container/Container';
import { AccessibilitySystem } from './AccessibilitySystem';
import { accessibilityTarget } from './accessibilityTarget';

extensions.add(AccessibilitySystem);
extensions.mixin(Container, accessibilityTarget);
