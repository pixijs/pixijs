import { deprecation } from '@pixi/utils';
import * as _systems from './systems';
import * as _resources from './textures/resources';

/**
 * @memberof PIXI
 * @namespace resources
 * @see PIXI
 * @deprecated since 6.0.0
 */
const resources = {};

for (const name in _resources)
{
    Object.defineProperty(resources, name,
        {
            get()
            {
                deprecation('6.0.0', `@pixi/core.systems.${name} has moved to @pixi/core.${name}`);

                return (_resources as any)[name];
            },
        });
}

/**
 * @memberof PIXI
 * @namespace systems
 * @see PIXI
 * @deprecated since 6.0.0
 */
const systems = {};

for (const name in _systems)
{
    Object.defineProperty(systems, name,
        {
            get()
            {
                deprecation('6.0.0', `@pixi/core.resources.${name} has moved to $pixi/core.${name}`);

                return (_systems as any)[name];
            },
        });
}

export { resources, systems };
