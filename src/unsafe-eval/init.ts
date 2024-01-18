import { GlUniformBufferSystem, GpuUniformBufferSystem } from '../rendering';
import { GlUniformGroupSystem } from '../rendering/renderers/gl/shader/GlUniformGroupSystem';
import { generateUniformBufferSyncPolyfillSTD40 } from './generateUniformBufferSyncPolyfill';
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

    Object.assign(GlUniformBufferSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformBufferSync: generateUniformBufferSyncPolyfillSTD40,
        }
    );

    Object.assign(GpuUniformBufferSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformBufferSync: generateUniformBufferSyncPolyfillSTD40,
        }
    );
}

selfInstall();
