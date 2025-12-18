import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { Filter } from '../../Filter';
import vertex from '../defaultFilter.vert';
import fragment from './passthrough.frag';
import source from './passthrough.wgsl';

/**
 * The PassthroughFilter passes the input data through without altering it.
 * It serves as a basic filter, performing no graphical alterations.
 * @category filters
 * @internal
 */
export class PassthroughFilter extends Filter
{
    constructor()
    {
        const gpuProgram = GpuProgram.from({
            vertex: { source, entryPoint: 'mainVertex' },
            fragment: { source, entryPoint: 'mainFragment' },
            name: 'passthrough-filter'
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'passthrough-filter'
        });

        super({
            gpuProgram,
            glProgram,
        });
    }
}
