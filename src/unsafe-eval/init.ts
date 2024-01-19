import { GlUboSystem } from '../rendering/renderers/gl/GlUboSystem';
import { GlUniformGroupSystem } from '../rendering/renderers/gl/shader/GlUniformGroupSystem';
import { GpuUboSystem } from '../rendering/renderers/gpu/GpuUboSystem';
import {
    generateUboSyncPolyfillSTD40,
    generateUboSyncPolyfillWGSL
} from './generateUboSyncPolyfill';
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

    Object.assign(GlUboSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformBufferSync: generateUboSyncPolyfillSTD40,
        }
    );

    Object.assign(GpuUboSystem.prototype,
        {
            _systemCheck()
            {
                // Do nothing, don't throw error
            },

            // use polyfill which avoids eval method
            _generateUniformBufferSync: generateUboSyncPolyfillWGSL,
        }
    );
}

selfInstall();
