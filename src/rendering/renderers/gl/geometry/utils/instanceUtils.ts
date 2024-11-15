import { getAttributeInfoFromFormat } from '../../../shared/geometry/utils/getAttributeInfoFromFormat';
import { getGlTypeFromFormat } from './getGlTypeFromFormat';

import type { Buffer } from '../../../shared/buffer/Buffer';
import type { Attribute, ExtractedAttributeData } from '../../../shared/geometry/Attribute';
import type { Geometry } from '../../../shared/geometry/Geometry';
import type { GlBufferSystem } from '../../buffer/GlBufferSystem';

export type AttributeBaseCallback = (gl: WebGL2RenderingContext, locations: number[], baseInstance: number,
    bufferSystem?: GlBufferSystem, buffers?: Buffer[], lastBuffer?: Buffer)
=> Buffer;

export type AttributeBaseCallbackStruct = { syncFunc: AttributeBaseCallback, bufSyncCount: number,
    bufFirstIndex: number, stride: number};

export const attribSyncCache: Record<string, AttributeBaseCallbackStruct> = {};

export function generateAttributesSignature(attributes: Attribute[]): string
{
    let s = '';

    for (let i = 0; i < attributes.length; i++)
    {
        const attr = attributes[i];

        if (i > 0)
        {
            s += '|';
        }
        s += `${attr.buffer}/${attr.format}/${attr.stride}/${attr.offset}`;
    }

    return s;
}

export function generateAttributeSync(attributes: Attribute[], genBuffers: boolean): AttributeBaseCallbackStruct
{
    const funcFragments = [];
    let lastBuffer = -1;
    let bufSyncCount = 0;

    for (let i = 0; i < attributes.length; i++)
    {
        const attr = attributes[i];
        const bufInd = attr.bufferIndex;

        if (genBuffers && lastBuffer !== bufInd)
        {
            lastBuffer = bufInd;
            funcFragments.push(`
if (lastBuffer !== buffers[${bufInd}]) {
    lastBuffer = buffers[${bufInd}];
    bufferSystem.bind(lastBuffer);
}`);
            bufSyncCount++;
        }

        const attrInfo = getAttributeInfoFromFormat(attr.format);
        const type = getGlTypeFromFormat(attr.format);

        if (attr.format.substring(1, 4) === 'int')
        {
            // eslint-disable-next-line max-len
            funcFragments.push(`gl.vertexAttribIPointer(locations[${i}], ${attrInfo.size}, ${type}, ${attr.stride}, instOffset * ${attr.stride} + ${attr.offset})`);
        }
        else
        {
            // eslint-disable-next-line max-len
            funcFragments.push(`gl.vertexAttribPointer(locations[${i}], ${attrInfo.size}, ${type}, ${attrInfo.normalised}, ${attr.stride}, instOffset * ${attr.stride} + ${attr.offset})\n`);
        }
    }
    let syncFunc: AttributeBaseCallback;

    if (genBuffers)
    {
        funcFragments.push(`return lastBuffer;`);
        // eslint-disable-next-line no-new-func
        syncFunc = new Function('gl', 'locations', 'instOffset',
            'bufferSystem', 'buffers', 'lastBuffer', funcFragments.join('\n')) as AttributeBaseCallback;
    }
    else
    {
        // eslint-disable-next-line no-new-func
        syncFunc = new Function('gl', 'locations', 'instOffset', funcFragments.join('\n')) as AttributeBaseCallback;
    }

    return {
        syncFunc,
        bufSyncCount,
        bufFirstIndex: attributes[0].bufferIndex,
        stride: attributes[0].stride
    };
}

export function generateAttribSyncForGeom(geom: Geometry): AttributeBaseCallbackStruct
{
    const { attributes } = geom;
    let firstBuf = -1;
    let genBuffers = false;
    const instAttribs: Attribute[] = [];

    for (const i in attributes)
    {
        const attr = attributes[i];

        if (attr.instance)
        {
            instAttribs.push(attr);
            if (firstBuf !== attr.bufferIndex)
            {
                if (firstBuf !== -1)
                {
                    genBuffers = true;
                }
                else
                {
                    firstBuf = attr.bufferIndex;
                }
            }
        }
    }

    const sign = generateAttributesSignature(instAttribs);

    let val = attribSyncCache[sign];

    if (!val)
    {
        val = attribSyncCache[sign] = generateAttributeSync(instAttribs, genBuffers);
    }

    return val;
}

export function getInstancedAttributeNames(attributes: Record<string, Attribute>): string[]
{
    const instAttribs: string[] = [];

    for (const i in attributes)
    {
        const attr = attributes[i];

        if (attr.instance)
        {
            instAttribs.push(i);
        }
    }

    return instAttribs;
}

export function getLocationListByAttributes(names: Array<string>,
    attributeData: Record<string, ExtractedAttributeData>): number[]
{
    // returns locations
    const res: Array<number> = [];

    for (let i = 0; i < names.length; i++)
    {
        const attribData = attributeData[names[i]];

        if (attribData)
        {
            res.push(attribData.location);
        }
    }

    return res;
}
