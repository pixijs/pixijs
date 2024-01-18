import { GlUniformBufferSystem } from '../rendering/renderers/gl/GlUniformBufferSystem';
import { GlUniformGroupSystem } from '../rendering/renderers/gl/shader/GlUniformGroupSystem';
import { GpuUniformBufferSystem } from '../rendering/renderers/gpu/GpuUniformBufferSystem';
import {
    generateUniformBufferSyncPolyfillSTD40,
    generateUniformBufferSyncPolyfillWGSL
} from './generateUniformBufferSyncPolyfill';
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
            _generateUniformBufferSync: generateUniformBufferSyncPolyfillWGSL,
        }
    );
}

selfInstall();
