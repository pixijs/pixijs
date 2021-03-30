import type { Dict } from '@pixi/utils';
import { mapSize } from '../utils';
import { IUniformData } from '../Program';
import { UniformGroup } from '../UniformGroup';
import { uniformParsers } from './uniformParsers';
import type { Renderer } from '../../Renderer';
import type { Buffer } from '../../geometry/Buffer';

export type UniformsSyncCallback = (...args: any[]) => void;

function uboUpdate(_ud: any, _uv: any, _renderer: Renderer, _syncData: any, buffer: Buffer): void
{
    _renderer.buffer.update(buffer);
}

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
    vec3:   12,
    vec4:   16,

    int:      4,
    ivec2:    8,
    ivec3:    12,
    ivec4:    16,

    uint:     4,
    uvec2:    8,
    uvec3:    12,
    uvec4:    16,

    bool:     4,
    bvec2:    8,
    bvec3:    12,
    bvec4:    16,

    mat2:     16 * 2,
    mat3:     16 * 3,
    mat4:     16 * 4,
};

interface UBOElement {
    data: IUniformData
    offset: number,
    dataLen: number,
    dirty: number
}

/**
 * @ignore
 *
 * logic originally from here: https://github.com/sketchpunk/FunWithWebGL2/blob/master/lesson_022/Shaders.js
 * rewrote it, but this was a great starting point to get a solid understanding of whats going on :)
 *
 * @param uniformData
 */
export function createUBOElements(uniformData: IUniformData[]): {uboElements: UBOElement[], size: number}
{
    const uboElements: UBOElement[] = uniformData.map((data: IUniformData) =>
        ({
            data,
            offset: 0,
            dataLen: 0,
            dirty: 0
        }));

    let size = 0;
    let chunkSize = 0;
    let offset = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        size = GLSL_TO_STD40_SIZE[uboElement.data.type];

        if (uboElement.data.size > 1)
        {
            size = Math.max(size, 16) * uboElement.data.size;
        }

        uboElement.dataLen = size;

        // add some size offset..
        // must align to the nearest 16 bytes or internally nearest round size

        if (chunkSize % size !== 0 && chunkSize < 16)
        {
            // diff required to line up..
            const lineUpValue = (chunkSize % size) % 16;

            chunkSize += lineUpValue;
            offset += lineUpValue;
        }

        if ((chunkSize + size) > 16)
        {
            offset = Math.ceil(offset / 16) * 16;
            uboElement.offset = offset;
            offset += size;
            chunkSize = size;
        }
        else
        {
            uboElement.offset = offset;
            chunkSize += size;
            offset += size;
        }
    }

    offset = Math.ceil(offset / 16) * 16;

    return { uboElements, size: offset };
}

export function getUBOData(uniforms: Dict<any>, uniformData: Dict<any>): any[]
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

export function generateUniformBufferSync(
    group: UniformGroup,
    uniformData: Dict<any>
): {size: number, syncFunc: UniformsSyncCallback}
{
    if (!group.autoManage)
    {
        // if the group is nott automatically managed, we don't need to generate a special function for it...
        return { size: 0, syncFunc: uboUpdate };
    }

    const usedUniformDatas = getUBOData(group.uniforms, uniformData);

    const { uboElements, size } = createUBOElements(usedUniformDatas);

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

    return {
        size,
        // eslint-disable-next-line no-new-func
        syncFunc: new Function(
            'ud',
            'uv',
            'renderer',
            'syncData',
            'buffer',
            funcFragments.join('\n')
        ) as UniformsSyncCallback
    };
}
