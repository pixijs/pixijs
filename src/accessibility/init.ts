// import { extensions } from '../extensions/Extensions';
import { Container } from '../rendering/scene/Container';
// import { AccessibilitySystem } from './AccessibilitySystem';
import { accessibilityTarget } from './accessibilityTarget';

// extensions.add(AccessibilitySystem);
Container.mixin(accessibilityTarget);
