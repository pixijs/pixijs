import { GlUboSystem } from '../rendering/renderers/gl/GlUboSystem';
import { GlShaderSystem } from '../rendering/renderers/gl/shader/GlShaderSystem';
import { GlUniformGroupSystem } from '../rendering/renderers/gl/shader/GlUniformGroupSystem';
import { GpuUboSystem } from '../rendering/renderers/gpu/GpuUboSystem';
import { AbstractRenderer } from '../rendering/renderers/shared/system/AbstractRenderer';
import { generateShaderSyncPolyfill } from './shader/generateShaderSyncPolyfill';
import {
    generateUboSyncPolyfillSTD40,
    generateUboSyncPolyfillWGSL
} from './ubo/generateUboSyncPolyfill';
import { generateUniformsSyncPolyfill } from './uniforms/generateUniformsSyncPolyfill';

function selfInstall()
{
    Object.assign(AbstractRenderer.prototype, {
        // override unsafeEval check, as we don't need to use it
        _unsafeEvalCheck()
        {
            // Do nothing, don't throw error
        },
    });

    Object.assign(GlUniformGroupSystem.prototype, {
        // use polyfill which avoids eval method
        _generateUniformsSync: generateUniformsSyncPolyfill,
    });

    Object.assign(GlUboSystem.prototype, {
        // use polyfill which avoids eval method
        _generateUniformBufferSync: generateUboSyncPolyfillSTD40,
    });

    Object.assign(GpuUboSystem.prototype, {
        // use polyfill which avoids eval method
        _generateUniformBufferSync: generateUboSyncPolyfillWGSL,
    });

    Object.assign(GlShaderSystem.prototype, {
        // use polyfill which avoids eval method
        _generateShaderSync: generateShaderSyncPolyfill,
    });
}

selfInstall();
