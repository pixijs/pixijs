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
                // #if _DEBUG
                deprecation('6.0.0', `PIXI.systems.${name} has moved to PIXI.${name}`);
                // #endif

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
                // #if _DEBUG
                deprecation('6.0.0', `PIXI.resources.${name} has moved to PIXI.${name}`);
                // #endif

                return (_systems as any)[name];
            },
        });
}

export { resources, systems };
