import type { Dict } from '@pixi/utils';
import { mapSize } from '../utils';
import { IUniformData } from '../Program';
import { UniformGroup } from '../UniformGroup';
import { uniformParsers } from './uniformParsers';

export type UniformsSyncCallback = (...args: any[]) => void;

// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location
const UBO_TO_SINGLE_SETTERS: Dict<string> = {
    float: `
        data[offset] = v;
    `,
    vec2: `
        data[offset] = v[0];
        data[offset+1] = v[1];
    `,
    vec3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];
        
    `,
    vec4: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];
        data[offset+3] = v[3];
    `,
    mat2: `
        data[offset] = v[0];
        data[offset+1] = v[1];

        data[offset+4] = v[2];
        data[offset+5] = v[3];
    `,
    mat3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];

        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];
    `,
    mat4: `
        for(var i = 0; i < 16; i++)
        {
            data[offset + i] = v[i];
        }
    `
};

const GLSL_TO_STD40_SIZE: Dict<number> = {
    float:  4,
    vec2:   8,
    vec3:   16,
    vec4:   16,

    int:      4,
    ivec2:    8,
    ivec3:    16,
    ivec4:    16,

    uint:     4,
    uvec2:    8,
    uvec3:    16,
    uvec4:    16,

    bool:     4,
    bvec2:    8,
    bvec3:    16,
    bvec4:    16,

    mat2:     16 * 2,
    mat3:     16 * 3,
    mat4:     16 * 4,
};

interface UBOElement {
    data:IUniformData
    offset:number,
    dataLen:number,
    chunkLen:number
    dirty:number
}

/**
 *
 * logic originally from here: https://github.com/sketchpunk/FunWithWebGL2/blob/master/lesson_022/Shaders.js
 *
 * @param uniformData
 */
export function createUBOElements(uniformData:IUniformData[]):{uboElements:UBOElement[], size:number}
{
    const uboElements:UBOElement[] = uniformData.map((data:IUniformData) =>
        ({
            data,
            offset: 0,
            dataLen: 0,
            chunkLen: 0,
            dirty: 0
        }));

    let chunk = 16;	// Data size in Bytes, UBO using layout std140 needs to build out the struct in chunks of 16 bytes.
    let remainingChunk = 0;	// Temp Size, How much of the chunk is available after removing the data size from it
    let offset = 0;	// Offset in the buffer allocation
    let size = 0;	// Data Size of the current type

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        size = GLSL_TO_STD40_SIZE[uboElement.data.type];

        if (uboElement.data.size > 1)
        {
            size = Math.max(size, 16) * uboElement.data.size;
        }

        remainingChunk = chunk - size;	// How much of the chunk exists after taking the size of the data.

        // Chunk has been overdrawn when it already has some data reserved for it.
        if (remainingChunk < 0 && chunk < 16)
        {
            offset += chunk;						// Add Remaining Chunk to offset...
            if (i > 0) uboElements[i - 1].chunkLen += chunk;	// So the remaining chunk can be used by the last variable
            chunk = 16;								// Reset Chunk
        }
        else if (remainingChunk < 0 && chunk === 16)
        {
            // Do nothing in case data length is >= to unused chunk size.
            // Do not want to change the chunk size at all when this happens.
        }
        else if (remainingChunk === 0)
        {
            chunk = 16;				// If evenly closes out the chunk, reset
        }
        else
        {
            chunk -= size;	// Chunk isn't filled, just remove a piece
        }

        // Add some data of how the chunk will exist in the buffer.

        uboElement.offset = offset;
        uboElement.chunkLen = size;
        uboElement.dataLen = size;

        offset += size;
    }

    // Check if the final offset is divisible by 16, if not add remaining chunk space to last element.
    if (offset % 16 !== 0)
    {
        uboElements[uboElements.length - 1].chunkLen += chunk;
        offset += chunk;
    }

    return { uboElements, size: offset };
}

export function getUBOData(uniforms: Dict<any>, uniformData: Dict<any>):any[]
{
    const usedUniformDatas = [];

    // build..
    for (const i in uniforms)
    {
        if (uniformData[i])
        {
            usedUniformDatas.push(uniformData[i]);
        }
    }

    // sort them out by index!
    usedUniformDatas.sort((a, b) => a.index - b.index);

    return usedUniformDatas;
}

export function generateUniformBufferSync(group: UniformGroup, uniformData: Dict<any>): UniformsSyncCallback
{
    if (!group.autoManage)
    {
        return (_ud, _uv, _renderer, _syncData, buffer) =>
        {
            buffer.update();
        };
    }

    const usedUniformDatas = getUBOData(group.uniforms, uniformData);

    const { uboElements, size } = createUBOElements(usedUniformDatas);

    const data = new Float32Array(size / 4);

    group.buffer.update(data);

    const funcFragments = [`
    var v = null;
    var v2 = null;
    var cv = null;
    var t = 0;
    var gl = renderer.gl
    var index = 0;
    var data = buffer.data;
    `];

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];
        const uniform = group.uniforms[uboElement.data.name];

        const name = uboElement.data.name;

        let parsed = false;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            const uniformParser = uniformParsers[j];

            if (uniformParser.codeUbo && uniformParser.test(uboElement.data, uniform))
            {
                funcFragments.push(
                    `offset = ${uboElement.offset / 4};`,
                    uniformParsers[j].codeUbo(uboElement.data.name, uniform));
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            if (uboElement.data.size > 1)
            {
                const size =  mapSize(uboElement.data.type);
                const rowSize = Math.max(GLSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
                const elementSize = size / rowSize;
                const remainder = (4 - (elementSize % 4)) % 4;

                funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};

                t = 0;

                for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
                {
                    for(var j = 0; j < ${elementSize}; j++)
                    {
                        data[offset++] = v[t++];
                    }
                    offset += ${remainder};
                }

                `);
            }
            else
            {
                const template = UBO_TO_SINGLE_SETTERS[uboElement.data.type];

                funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};
                ${template};
                `);
            }
        }
    }

    funcFragments.push(`
       renderer.buffer.update(buffer);
    `);

    // eslint-disable-next-line no-new-func
    return new Function('ud', 'uv', 'renderer', 'syncData', 'buffer', funcFragments.join('\n')) as UniformsSyncCallback;
}

