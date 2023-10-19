import { GlUniformGroupSystem } from '../rendering/renderers/gl/shader/GlUniformGroupSystem';
import { UniformBufferSystem } from '../rendering/renderers/shared/shader/UniformBufferSystem';
import { generateUniformBufferSyncPolyfill } from './generateUniformBufferSyncPolyfill';
import { generateUniformsSyncPolyfill } from './generateUniformsSyncPolyfill';

function selfInstall()
{
    Object.assign(GlUniformGroupSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformsSync: generateUniformsSyncPolyfill,
        }
    );

    Object.assign(UniformBufferSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformBufferSync: generateUniformBufferSyncPolyfill,
        }
    );
}

selfInstall();
